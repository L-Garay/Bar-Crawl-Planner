import {
  Client,
  PlaceData,
  PlacePhotoResponse,
  PlaceType2,
  TextSearchResponse,
} from '@googlemaps/google-maps-services-js';
import dotenv from 'dotenv';
import {
  CITY_COORDINATES,
  DETAILS_FIELDS_TO_RETURN,
  LOCATION_DATA_EXPIRATION_DAYS,
} from '../../constants/mapConstants';
import { CitySelectOptions, LocationDetails } from '../../types/sharedTypes';
import { Sleep, GetPrismaError } from '../../utilities';
import { prismaClient } from '../../index';
import { QueryData } from '../../types/sharedTypes';

dotenv.config();

const ExecuteSearch = async (searchParams: any) => {
  const googleClient = new Client({});

  // NOTE
  // TODO
  // NOTE
  // TODO will need to think about how to implement retry logic here
  // I'm thinking we retry each request once
  // if it fails on the third request, we can still send the results from the first two
  let locationResults: Partial<PlaceData>[] = [];
  const response: TextSearchResponse = await googleClient.textSearch({
    params: searchParams,
    timeout: 5000,
  });

  if (response.status === 200) {
    locationResults.push(...response.data.results);
  } else {
    const error = {
      status: response.data.status,
      message: response.data.error_message,
      headers: response.headers,
    };
    console.error('Error fetching first page of search results', error);
    // TODO ideally log this in some sort of monitoring service
  }
  let secondResponse;
  if (response.data.next_page_token) {
    await Sleep(2000); // it is known that Google imposes a 2sec delay between pagintation calls
    secondResponse = await googleClient.textSearch({
      params: {
        ...searchParams,
        pagetoken: response.data.next_page_token,
      },
      timeout: 5000,
    });
  }
  if (secondResponse && secondResponse.status === 200) {
    locationResults.push(...secondResponse.data.results);
  } else {
    const error = {
      status: response.data.status,
      message: response.data.error_message,
      headers: response.headers,
    };
    console.error('Error fetching second page of search results', error);
    // TODO ideally log this in some sort of monitoring service
  }

  let thirdResponse;
  if (secondResponse && secondResponse.data.next_page_token) {
    await Sleep(2000);
    thirdResponse = await googleClient.textSearch({
      params: {
        ...searchParams,
        pagetoken: secondResponse.data.next_page_token,
      },
      timeout: 5000,
    });
  }
  if (thirdResponse && thirdResponse.status === 200) {
    locationResults.push(...thirdResponse.data.results);
  } else {
    const error = {
      status: response.data.status,
      message: response.data.error_message,
      headers: response.headers,
    };
    console.error('Error fetching third page of search results', error);
    // TODO ideally log this in some sort of monitoring service
  }
  return locationResults;
};

export const SearchCity = async (
  city: CitySelectOptions,
  locationType: string
): Promise<QueryData> => {
  const googleClient = new Client({});

  console.log(city, 'CITY');
  console.log(locationType, 'LOCATION TYPE');

  const searchParams = {
    query: locationType,
    location: {
      lat: CITY_COORDINATES[city].lat,
      lng: CITY_COORDINATES[city].lng,
    },
    radius: 8045, // 5 miles
    key: process.env.GOOGLE_MAPS_API_KEY!,
  };

  const locationResults = await ExecuteSearch(searchParams);

  if (locationResults.length > 0) {
    const formattedResults: Promise<LocationDetails | null>[] =
      locationResults.map(async (result) => {
        const photoReferences = result.photos
          ? result.photos.map(
              (photo) =>
                photo.photo_reference +
                `&maxwidth=${photo.width}&maxheight=${
                  photo.height
                }&attributions=${JSON.stringify(photo.html_attributions)}`
            )
          : [];

        const textSearchResult = {
          business_status: result.business_status,
          formatted_address: result.formatted_address,
          lat: result.geometry?.location.lat,
          lng: result.geometry?.location.lng,
          icon: result.icon,
          icon_mask_base_uri: result.icon_mask_base_uri,
          icon_background_color: result.icon_background_color,
          name: result.name,
          place_id: result.place_id,
          rating: result.rating,
          user_ratings_total: result.user_ratings_total,
          types: result.types,
          plus_compound_code: result.plus_code?.compound_code,
          plus_global_code: result.plus_code?.global_code,
          photos_references: photoReferences,
        };

        const detailsRequest = {
          place_id: result.place_id!,
          fields: DETAILS_FIELDS_TO_RETURN,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        };

        let detailsData;
        detailsData = await googleClient.placeDetails({
          params: detailsRequest,
        });

        // if the request status is one of these, there is no point in retrying at this time
        if (
          detailsData.data.status === 'NOT_FOUND' ||
          'ZERO_RESULTS' ||
          'OVER_QUERY_LIMIT' ||
          'REQUEST_DENIED'
        ) {
          return Promise.resolve(null);
        } else if (
          /* if the request status is one of these two, we can try to make another request. Although, I'm not sure what could be invalid for this simple request. */
          detailsData.data.status === 'INVALID_REQUEST' ||
          'UNKNOWN_ERROR'
        ) {
          detailsData = await googleClient.placeDetails({
            params: {
              place_id: result.place_id!,
              fields: [
                'reviews',
                'url',
                'website',
                'price_level',
                'utc_offset',
                'opening_hours',
                'vicinity',
                'formatted_phone_number',
                'address_components',
              ],
              key: process.env.GOOGLE_MAPS_API_KEY!,
            },
          });
        }
        // if after the retry, the status is still not OK, we can't do anything with this result so we return null and log the error
        if (detailsData.data.status !== 'OK') {
          const error = {
            status: detailsData.data.status,
            message: detailsData.data.error_message,
            headers: detailsData.headers,
          };
          console.error(
            `Error fetching details for location: ${result.place_id}`,
            error
          );
          // TODO ideally log this in some sort of monitoring service
          return Promise.resolve(null);
        }

        const detailsResult = detailsData.data.result;

        const openPeriods = detailsResult.opening_hours?.periods.map((period) =>
          JSON.stringify(period)
        );

        const reviews = detailsResult.reviews?.map((review) =>
          JSON.stringify(review)
        );

        const cityType = 'locality' as PlaceType2;
        const city = detailsResult.address_components
          ? detailsResult.address_components.find((component) =>
              component.types.includes(cityType)
            )?.long_name
          : '';
        const stateType = 'administrative_area_level_1' as PlaceType2;
        const state = detailsResult.address_components
          ? detailsResult.address_components.find((component) =>
              component.types.includes(stateType)
            )?.long_name
          : '';

        const formattedDetailsResponse = {
          price_level: detailsResult.price_level,
          reviews,
          formatted_phone_number: detailsResult.formatted_phone_number,
          open_periods: openPeriods,
          weekday_text: detailsResult.opening_hours?.weekday_text,
          url: detailsResult.url,
          website: detailsResult.website,
          vicinity: detailsResult.vicinity,
          utc_offset_minutes: detailsResult.utc_offset,
          city,
          state,
        };

        const formattedResult: LocationDetails = {
          ...textSearchResult,
          ...formattedDetailsResponse,
          expiration_date: new Date(
            new Date().getTime() +
              LOCATION_DATA_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
          ).toISOString(),
        };
        return Promise.resolve(formattedResult);
      });

    const resolvedFormattedResults = await Promise.all(formattedResults);
    // Since we are returning null for locations that don't have location details, we need to filter those out before we try to insert them into the DB
    const filteredResolvedFormattedResults = resolvedFormattedResults.filter(
      (result) => result !== null
    ) as LocationDetails[];

    // TODO figure out how to handle all thee errors and possible returns
    try {
      await prismaClient.locationDetails.createMany({
        data: filteredResolvedFormattedResults,
        skipDuplicates: true,
      });
    } catch (error) {
      const newError = GetPrismaError(error);
      console.log('ERROR', newError.message, newError.name);
      return { status: 'Error', data: [], error: newError };
    }

    return { status: 'Success', data: resolvedFormattedResults };
  }
  return { status: 'Error', data: [] };
};
