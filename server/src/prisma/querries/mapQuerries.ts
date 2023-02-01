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

  let locationResults: Partial<PlaceData>[] = [];
  const response: TextSearchResponse = await googleClient.textSearch({
    params: searchParams,
    timeout: 5000,
  });

  if (response.status !== 200) {
    const error = {
      status: response.data.status,
      message: response.data.error_message,
    };
    throw error;
  }
  locationResults.push(...response.data.results);

  // let secondResponse;
  // if (response.data.next_page_token) {
  //   await Sleep(2000); // it is known that Google imposes a 2sec delay between pagintation calls
  //   secondResponse = await googleClient.textSearch({
  //     params: {
  //       ...searchParams,
  //       pagetoken: response.data.next_page_token,
  //     },
  //     timeout: 5000,
  //   });
  // }
  // if (secondResponse && secondResponse.status !== 200) {
  //   // is this the right way to handle an error for the second call?
  //   const error = {
  //     status: secondResponse.data.status,
  //     message: secondResponse.data.error_message,
  //   };
  //   throw error;
  // }

  // let thirdResponse;
  // if (secondResponse && secondResponse.data.next_page_token) {
  //   locationResults.push(...secondResponse.data.results);
  //   await Sleep(2000);
  //   thirdResponse = await googleClient.textSearch({
  //     params: {
  //       ...searchParams,
  //       pagetoken: secondResponse.data.next_page_token,
  //     },
  //     timeout: 5000,
  //   });
  // }
  // if (thirdResponse && thirdResponse.status !== 200) {
  //   const error = {
  //     status: thirdResponse.data.status,
  //     message: thirdResponse.data.error_message,
  //   };
  //   throw error;
  // } else if (thirdResponse) {
  //   locationResults.push(...thirdResponse.data.results);
  // }
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
    const formattedResults: Promise<LocationDetails>[] = locationResults.map(
      async (result) => {
        // have to make separate call to get each individual photo
        // use each photo's photo_reference and dimensions
        // specify return type as blob

        const blobPhotos = result.photos?.map(async (photo) => {
          const image: PlacePhotoResponse = await googleClient.placePhoto({
            params: {
              photoreference: photo.photo_reference,
              maxheight: photo.height,
              maxwidth: photo.width,
              key: process.env.GOOGLE_MAPS_API_KEY!,
            },
            responseType: 'blob',
          });
          return Promise.resolve(image.data as Blob);
        });
        // read the contents of each blob and convert to string
        const resolvedBlobPhotos = blobPhotos
          ? await Promise.all(blobPhotos)
          : [];

        const convertedBlobStringsPromises = resolvedBlobPhotos.map(
          async (blobPhoto) => {
            const text = await new Response(blobPhoto).text();
            return Promise.resolve(text);
          }
        );
        const convertedBlobStrings = await Promise.all(
          convertedBlobStringsPromises
        );
        console.log(convertedBlobStrings[0], 'CONVERTED BLOB STRINGS');

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
          photos: convertedBlobStrings,
        };

        // AT THIS POINT WE NEED TO MAKE A PLACE DETAILS REQUEST
        const detailsRequest = {
          place_id: result.place_id!,
          fields: DETAILS_FIELDS_TO_RETURN,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        };

        const detailsData = await googleClient.placeDetails({
          params: detailsRequest,
        });

        if (detailsData.status !== 200) {
          const error = {
            status: detailsData.data.status,
            message: detailsData.data.error_message,
          };
          throw error;
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
          // reviews,
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
      }
    );

    const resolvedFormattedResults = await Promise.all(formattedResults);

    try {
      await prismaClient.locationDetails.createMany({
        data: resolvedFormattedResults,
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
