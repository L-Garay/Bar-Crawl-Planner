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
  LOCATION_FILTER_TERMS,
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

// Initial plans
// I'm thinking we use the city argument to first return all locations in that city
// Then we apply specific filters/sorting here in the client
// We'll need to use the locationType argument to try to filter the results
// I'm thinking we make a list of different variations/terms for each type of location
// I.e. for Breweries we could search the location names and see if the .includes() 'brew' which should capture brewery, microbrewery, breweries and so on
// Then at this point, we can then sort the results by total number of reviews and prioritize the most reviewed
// OR we can do a combination of sorting by total number AND average rating
// Where we create brackets/certain cutoffs for total number of reviews or rating, and for each bracket we sort by average rating or total number of reviews and only return the best reviewed for each bracket
// I.e. A location with a 5 star rating but only 20 reviews should be lower on the list than a location with a 4.5 star rating but 400 reviews
// The cutoffs will likely need to continuously be adjusted as we get more data and test what locations are getting returned more/less often
export const SearchCity = async (
  city: CitySelectOptions,
  locationType: string
): Promise<QueryData> => {
  // 1. Get all locations in the city sorted by total number of reviews
  const allLocationsInCity = await prismaClient.locationDetails.findMany({
    where: {
      city: city,
    },
    orderBy: {
      user_ratings_total: 'desc',
    },
  });

  // 2. Filter the results by location type
  const checkTypes = (location: any) => {
    if (
      LOCATION_FILTER_TERMS[
        locationType as keyof typeof LOCATION_FILTER_TERMS
      ].some((term) => location.name?.includes(term))
    ) {
      return true;
    } else {
      return false;
    }
  };

  const filteredLocations = allLocationsInCity.filter((location) =>
    checkTypes(location)
  );

  // 3. Sort by average rating
  // at this point they SHOULD be sorted by total number of reviews, but we'll sort again just to be sure
  const sortedLocationsByTotalRatings = filteredLocations.sort((a, b) => {
    if (!a.user_ratings_total || !b.user_ratings_total) {
      return 0;
    } else if (a.user_ratings_total < b.user_ratings_total) {
      return 1; // place a has less reviews than place be, so sort a after b
    } else {
      return -1; // place a has more reviews than place be, so sort before b
    }
  });
};
