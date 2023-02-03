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
import {
  CitySelectOptions,
  GoogleError,
  LocationDetails,
} from '../../types/sharedTypes';
import { Sleep, GetPrismaError } from '../../utilities';
import { prismaClient } from '../../index';
import { QueryData } from '../../types/sharedTypes';

dotenv.config();

// NOTE not sure how I feel about this, I'm sure it can be refactored to be cleaner/more efficient
const ExecuteSearch = async (searchParams: any, city: string) => {
  const googleClient = new Client({});

  // variable to hold all results
  let locationResults: Partial<PlaceData>[] = [];

  let response: TextSearchResponse = {} as TextSearchResponse;
  response = await googleClient.textSearch({
    params: searchParams,
    timeout: 5000,
  });

  console.log(response.data.status);

  // if it's any one of these statuses, no point in retrying
  if (
    response.data.status === 'NOT_FOUND' ||
    response.data.status === 'ZERO_RESULTS' ||
    response.data.status === 'OVER_QUERY_LIMIT' ||
    response.data.status === 'REQUEST_DENIED'
  ) {
    const error: GoogleError = {
      name: response.data.status,
      status: response.status,
      message: response.data.error_message,
    };
    console.error(
      `Error fetching first page of search results for city: ${city} and location type: ${searchParams.query}`,
      error
    );
    return { locationResults, error };
  } else if (
    response.data.status === 'INVALID_REQUEST' ||
    response.data.status === 'UNKNOWN_ERROR'
  ) {
    //retry only once
    response = await googleClient.textSearch({
      params: searchParams,
      timeout: 5000,
    });
  } else if (response.data.status === 'OK') {
    // otherwise we know the status is 'OK' so we can push the results
    locationResults.push(...response.data.results);
  }

  // if after the retry, the status is still not 'OK'
  // log the error and return the 0 results
  if (response.data.status !== 'OK') {
    const error: GoogleError = {
      name: response.data.status,
      status: response.status,
      message: response.data.error_message,
    };
    console.error(
      `Error re-fetching first page of search results for city: ${city} and location type: ${searchParams.query}`,
      error
    );
    return { locationResults, error };
    // TODO ideally log this in some sort of monitoring service
  }

  // repeat the same process for the second and third pages
  // let secondResponse: TextSearchResponse = {} as TextSearchResponse;
  // if (response.data.next_page_token) {
  //   // it is known that Google imposes a 2sec delay between pagintation calls
  //   await Sleep(2000);
  //   secondResponse = await googleClient.textSearch({
  //     params: {
  //       ...searchParams,
  //       pagetoken: response.data.next_page_token,
  //     },
  //     timeout: 5000,
  //   });
  // }
  // if (
  //   (secondResponse && secondResponse.data.status === 'NOT_FOUND') ||
  //   'ZERO_RESULTS' ||
  //   'OVER_QUERY_LIMIT' ||
  //   'REQUEST_DENIED'
  // ) {
  //   // at this point we know the first request was successful
  //   // so return those results
  //   const error: GoogleError = {
  //     status: secondResponse.status,
  //     name: secondResponse.data.status,
  //     message: secondResponse.data.error_message,
  //   };
  //   console.error(
  //     `Error fetching second page of search results for city: ${city} and location type: ${searchParams.query}`,
  //     error
  //   );
  //   return { locationResults, error };
  // } else if (
  //   (secondResponse && secondResponse.data.status === 'INVALID_REQUEST') ||
  //   'UNKNOWN_ERROR'
  // ) {
  //   await Sleep(2000);
  //   secondResponse = await googleClient.textSearch({
  //     params: searchParams,
  //     timeout: 5000,
  //   });
  // } else if (secondResponse && secondResponse.data.status === 'OK') {
  //   locationResults.push(...secondResponse.data.results);
  // }

  // if (secondResponse.data.status !== 'OK') {
  //   const error: GoogleError = {
  //     name: secondResponse.data.status,
  //     status: secondResponse.status,
  //     message: secondResponse.data.error_message,
  //   };
  //   console.error(
  //     `Error re-fetching second page of search results for city: ${city} and location type: ${searchParams.query}`,
  //     error
  //   );
  //   return { locationResults, error };
  //   // TODO ideally log this in some sort of monitoring service
  // }

  // let thirdResponse: TextSearchResponse = {} as TextSearchResponse;
  // if (secondResponse && secondResponse.data.next_page_token) {
  //   await Sleep(2000);
  //   thirdResponse = await googleClient.textSearch({
  //     params: {
  //       ...searchParams,
  //       pagetoken: secondResponse.data.next_page_token,
  //     },
  //     timeout: 5000,
  //   });
  // }

  // if (
  //   (thirdResponse && thirdResponse.data.status === 'NOT_FOUND') ||
  //   'ZERO_RESULTS' ||
  //   'OVER_QUERY_LIMIT' ||
  //   'REQUEST_DENIED'
  // ) {
  //   const error: GoogleError = {
  //     name: thirdResponse.data.status,
  //     status: thirdResponse.status,
  //     message: thirdResponse.data.error_message,
  //   };
  //   console.error(
  //     `Error fetching third page of search results for city: ${city} and location type: ${searchParams.query}`,
  //     error
  //   );
  //   return { locationResults, error };
  // } else if (
  //   (thirdResponse && thirdResponse.data.status === 'INVALID_REQUEST') ||
  //   'UNKNOWN_ERROR'
  // ) {
  //   await Sleep(2000);
  //   thirdResponse = await googleClient.textSearch({
  //     params: searchParams,
  //     timeout: 5000,
  //   });
  // } else if (thirdResponse && thirdResponse.data.status === 'OK') {
  //   locationResults.push(...thirdResponse.data.results);
  // }

  // if (thirdResponse && thirdResponse.data.status !== 'OK') {
  //   const error: GoogleError = {
  //     name: thirdResponse.data.status,
  //     status: thirdResponse.status,
  //     message: thirdResponse.data.error_message,
  //   };
  //   console.error(
  //     `Error re-fetching third page of search results for city: ${city} and location type: ${searchParams.query}`,
  //     error
  //   );
  //   return { locationResults, error };
  //   // TODO ideally log this in some sort of monitoring service
  // }

  // this will capture all results from the 3 pages if all requests are successful
  // otherwise, the second and third pages handle sending the known results if their requests fails
  return { locationResults, error: undefined };
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

  const { locationResults, error } = await ExecuteSearch(searchParams, city);

  if (locationResults.length > 0 && !error) {
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
          detailsData.data.status === 'ZERO_RESULTS' ||
          detailsData.data.status === 'OVER_QUERY_LIMIT' ||
          detailsData.data.status === 'REQUEST_DENIED'
        ) {
          return Promise.resolve(null);
        } else if (
          /* if the request status is one of these two, we can try to make another request. Although, I'm not sure what could be invalid for this simple request. */
          detailsData.data.status === 'INVALID_REQUEST' ||
          detailsData.data.status === 'UNKNOWN_ERROR'
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
          const error: GoogleError = {
            status: detailsData.status,
            name: detailsData.data.status,
            message: detailsData.data.error_message,
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
  } else {
    return { status: 'Error', data: [], error: error };
  }
};
