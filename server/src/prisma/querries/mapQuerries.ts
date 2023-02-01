import {
  Client,
  PlaceData,
  PlaceType2,
} from '@googlemaps/google-maps-services-js';
import dotenv from 'dotenv';
import {
  CITY_COORDINATES,
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

  // 1. check to see if there is a next_page_token and more results
  // 2. if there is, make another call to get the next page of results
  // 3. repeat if there are 60 total
  const response = await googleClient.textSearch({
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
  let secondResponse;
  if (response.data.next_page_token) {
    Sleep(2000); // it is known that Google imposes a 2sec delay between pagintation calls
    secondResponse = await googleClient.textSearch({
      params: {
        ...searchParams,
        pagetoken: response.data.next_page_token,
      },
      timeout: 5000,
    });
  }
  if (secondResponse && secondResponse.status !== 200) {
    // is this the right way to handle an error for the second call?
    const error = {
      status: secondResponse.data.status,
      message: secondResponse.data.error_message,
    };
    throw error;
  }
  let thirdResponse;
  if (secondResponse && secondResponse.data.next_page_token) {
    locationResults.push(...secondResponse.data.results);
    Sleep(2000);
    thirdResponse = await googleClient.textSearch({
      params: {
        ...searchParams,
        pagetoken: secondResponse.data.next_page_token,
      },
      timeout: 5000,
    });
  }
  if (thirdResponse && thirdResponse.status !== 200) {
    const error = {
      status: thirdResponse.data.status,
      message: thirdResponse.data.error_message,
    };
    throw error;
  } else if (thirdResponse) {
    locationResults.push(...thirdResponse.data.results);
  }
  return locationResults;
};

export const SearchCity = async (
  city: CitySelectOptions,
  locationType: string
): Promise<QueryData> => {
  const googleClient = new Client({});
  try {
    // Here is where the magic will happen, a lot of it
    // FIRST thing we'll want to do is check our 'cache' to see if we've already searched the passed in city for the passed in location type
    // if we have, we can just return that data
    // NOTE since we don't have a cache right now, we are going to skip this part for now
    // SECOND, if we don't have that data then we will need to actually make the call to the Google Maps API
    // should be pretty simple, know how to do it client side and know it works
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

    // At this point we may need to combine all the results
    // we will also likely need to format each result to match our schema
    // in which case once we have the combined results array we can then itterate over it and format each result accordingly
    let formattedResults: LocationDetails[] = [];
    if (locationResults.length) {
      locationResults.forEach((result) => {
        // serialize the hours and save as string
        const openPeriods = result.opening_hours?.periods.map((period) =>
          JSON.stringify(period)
        );
        // serialize the reviews and save as string
        const reviews = result.reviews?.map((review) => JSON.stringify(review));

        // get the city and state from the address_components array
        // need to check each component's types array to see if it includes the type we are looking for
        const cityType = 'locality' as PlaceType2;
        const city = result.address_components
          ? result.address_components.find((component) =>
              component.types.includes(cityType)
            )?.long_name
          : '';
        const stateType = 'administrative_area_level_1' as PlaceType2;
        const state = result.address_components
          ? result.address_components.find((component) =>
              component.types.includes(stateType)
            )?.long_name
          : '';

        // it would seem that the first type in the array is the one that matches the search query
        // so we can safely assume that these establishments are classified primarily as or associated with this first type
        const mainType = result.types ? result.types[0] : '';

        // have to make separate call to get each individual photo
        // use each photo's photo_reference and dimensions
        // specify return type as blob
        let convertedBlobStrings: string[] = [];
        if (result.photos) {
          const blobPhotos = result.photos.map((photo) => {
            let axiosResponse: any;
            googleClient
              .placePhoto({
                params: {
                  photoreference: photo.photo_reference,
                  maxheight: photo.height,
                  maxwidth: photo.width,
                  key: process.env.GOOGLE_MAPS_API_KEY!,
                },
                responseType: 'blob',
              })
              .then((response) => {
                axiosResponse = response.data;
              })
              .catch((error) => {
                console.error(error);
                return;
              });
            if (axiosResponse) {
              return axiosResponse;
            } else return;
          });
          // read the contents of each blob and convert to string
          blobPhotos?.forEach((blobPhoto) => {
            new Response(blobPhoto)
              .text()
              .then((text) => convertedBlobStrings.push(text));
          });
        }
        const formattedResult: LocationDetails = {
          business_status: result.business_status,
          formatted_address: result.formatted_address,
          city,
          state,
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
          main_type: mainType,
          vicinity: result.vicinity,
          formatted_phone_number: result.formatted_phone_number,
          plus_compound_code: result.plus_code?.compound_code,
          plus_global_code: result.plus_code?.global_code,
          open_periods: openPeriods,
          weekday_text: result.opening_hours?.weekday_text,
          photos: convertedBlobStrings,
          reviews: reviews,
          url: result.url,
          website: result.website,
          price_level: result.price_level,
          utc_offset_minutes: result.utc_offset,
          // Set the expiration date for the data to be X amount of days from when it is created
          expiration_date: new Date(
            new Date().getTime() +
              LOCATION_DATA_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
          ).toISOString(),
        };
        formattedResults.push(formattedResult);
      });
    }

    // THIRD, once we get the results back from Google there will be two things we need to do
    // attempt to save the results to the database
    try {
      await prismaClient.locationDetails.createMany({
        data: formattedResults,
        skipDuplicates: true,
      });
    } catch (error) {
      const newError = GetPrismaError(error);
      throw newError;
    }

    // if the code reaches here that should mean the locations were successfully saved to the database
    return { status: 'Success', data: formattedResults };
  } catch (error) {
    return { status: 'Failure', data: null, error };
  }
};
