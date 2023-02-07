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

  // 3. Sort by total ratings
  // at this point they SHOULD be sorted by total number of ratings, but we'll sort again just to be sure
  const sortedLocationsByTotalRatings = filteredLocations.sort((a, b) => {
    if (!a.user_ratings_total || !b.user_ratings_total) {
      return 0; // not sure what to do here
    } else if (a.user_ratings_total < b.user_ratings_total) {
      return 1; // place a has less reviews than place b, so sort a after b
    } else {
      return -1; // place a has more reviews than place b, so sort a before b
    }
  });

  // 4. Filter by average rating AND total number of reviews
  // We'll create the array beforehand because we'll need a swtich statement to evalutate the cutoffs and return the matching locations
  // We'll need to itterate through the array of sorted locations, and then for each location we'll switch on it's total number of reviews
  // each case will then be checking one of the cutoffs from USER_RATINGS_CUTOFFS
  // and so if the case evalutes to true, we'll know that the location meets the required number of reviews
  // then we can simply check if that location's rating then matches that's cuttoff's rating
  // if it does, we'll add it to the array of locations to return
  // then once that first switch finishes, we'll count the length of the array and if it's less than the number of locations we want to return we will then we'll repeat the switch
  // except this time for each cutoff, we'll lower the corresponding rating by 1 (or 2)
  // that should be enough to capture the desired amount of locations (which still needs TBD)

  const topLocations: any[] = sortedLocationsByTotalRatings.map((location) => {
    switch (location.user_ratings_total) {
      case 2000:
        if (location.rating && Number(location.rating) > 4.5) {
          return location;
        } else return;
      case 1500:
        if (location.rating && Number(location.rating) > 4.6) {
          return location;
        } else return;
      case 1000:
        if (location.rating && Number(location.rating) > 4.7) {
          return location;
        } else return;
      case 500:
        if (location.rating && Number(location.rating) > 4.8) {
          return location;
        } else return;
      case 100:
        if (location.rating && Number(location.rating) > 4.9) {
          return location;
        } else return;
      case 50:
        if (location.rating && Number(location.rating) > 5.0) {
          return location;
        } else return;

      default:
        return;
    }
  });
};

// Check topLocations length and repeat switch with reduced ratings if needed
