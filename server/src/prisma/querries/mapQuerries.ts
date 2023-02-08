import dotenv from 'dotenv';
import {
  LOCATION_FILTER_TERMS,
  NEARBY_CITIES,
  TOTAL_RATINGS_CUTOFFS,
} from '../../constants/mapConstants';
import { CitySelectOptions } from '../../types/sharedTypes';
import { GetPrismaError } from '../../utilities';
import { prismaClient } from '../../index';
import { QueryData } from '../../types/sharedTypes';
import { Prisma } from '@prisma/client';

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
  // Since each city search can span multiple municipalities, we need to search for all locations near the main city

  const fullCityName = city === 'Slc' ? 'Salt Lake City' : city;

  const allCities = Prisma.validator<Prisma.LocationDetailsWhereInput>()({
    city: fullCityName,
    OR: [
      {
        city: NEARBY_CITIES[city as keyof typeof NEARBY_CITIES][0],
      },
      {
        city: NEARBY_CITIES[city as keyof typeof NEARBY_CITIES][1],
      },
      {
        city: NEARBY_CITIES[city as keyof typeof NEARBY_CITIES][2],
      },
    ],
  });
  let allLocationsInCity: any[] = [];
  try {
    console.log('city: ', city);
    console.log(NEARBY_CITIES[city as keyof typeof NEARBY_CITIES][0]);
    console.log(NEARBY_CITIES[city as keyof typeof NEARBY_CITIES][1]);
    console.log(NEARBY_CITIES[city as keyof typeof NEARBY_CITIES][2]);

    allLocationsInCity = await prismaClient.locationDetails.findMany({
      where: {
        OR: [
          {
            city: fullCityName,
          },
          {
            city: NEARBY_CITIES[city as keyof typeof NEARBY_CITIES][0],
          },
          {
            city: NEARBY_CITIES[city as keyof typeof NEARBY_CITIES][1],
          },
          {
            city: NEARBY_CITIES[city as keyof typeof NEARBY_CITIES][2],
          },
        ],
      },
      orderBy: {
        user_ratings_total: 'desc',
      },
    });
    console.log(allLocationsInCity.length);
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Error', data: null, error: newError };
  }

  if (allLocationsInCity.length === 0) {
    return { status: 'Success', data: [] };
  }

  // 2. Filter the results by location type
  // right now we are just checking for names
  // TODO also want to search the location's types array
  const checkTypes = (location: any) => {
    const nameIncludesType = LOCATION_FILTER_TERMS[
      locationType as keyof typeof LOCATION_FILTER_TERMS
    ].some((term) => {
      return location.name?.toLowerCase().includes(term);
    });

    if (nameIncludesType) {
      return true;
    } else {
      return false;
    }
  };

  const filteredLocations = allLocationsInCity.filter((location) =>
    checkTypes(location)
  );

  if (filteredLocations.length === 0) {
    console.log('filtered locations empty');

    return { status: 'Success', data: [] };
  }

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

  //NOTE
  // NOTE
  // TODO
  // TODO the rating cutoffs will have to be significantly lowered, for Boise there supposedly only 3 locations that meet the current criteria for both itterations
  // NOTE I'm thinking we may want to greatly simplify the total ratings/average rating system
  // maybe just have a cutoff of a 4.0 rating for locations with over 2000 reviews
  // have a cutoff of 4.3 rating for locations with over 1000 reviews
  // have a cutoff of 4.5 rating for locations with over 500 reviews
  // have a 4.7 rating for any locations below 500 reviews
  // TODO also need to investigate why some results are being returned/saved in the array as just null while some are being returned as full LocationDetails objects but with every field null
  // ideally we don't return anything that is null but since we are in maps, we may just have to filter out the null results once we escape the map()
  // however, having a mix of nulls and objects will null fields will just add an extra layer of complexity to the cleanup
  const checkTotalRatings = (totalRatings: number, cutoff: number) => {
    if (totalRatings >= cutoff) {
      return true;
    } else {
      return false;
    }
  };

  const topLocations: any[] = sortedLocationsByTotalRatings.map((location) => {
    const totalRatings = location.user_ratings_total
      ? location.user_ratings_total
      : 0;
    console.log(totalRatings);

    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[0])) {
      if (location.rating && Number(location.rating) > 4.5) {
        console.log(location, 4.5);
        return location;
      } else {
        return 'test';
      }
    }
    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[1])) {
      if (location.rating && Number(location.rating) > 4.6) {
        console.log(location, 4.6);
        return location;
      } else {
        return 'test';
      }
    }
    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[2])) {
      if (location.rating && Number(location.rating) > 4.7) {
        console.log(location, 4.7);
        return location;
      } else {
        return 'test';
      }
    }
    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[3])) {
      if (location.rating && Number(location.rating) > 4.8) {
        console.log(location, 4.8);
        return location;
      } else {
        return 'test';
      }
    }
    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[4])) {
      if (location.rating && Number(location.rating) > 4.9) {
        console.log(location, 4.9);
        return location;
      } else {
        return 'test';
      }
    }
    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[5])) {
      if (location.rating && Number(location.rating) > 5.0) {
        console.log(location, 5);
        return location;
      } else {
        return 'test';
      }
    }
  });

  // Check topLocations length and repeat switch with reduced ratings if needed
  let extraTopLocations: any[] = [];
  if (topLocations.length < 100) {
    extraTopLocations = sortedLocationsByTotalRatings.map((location) => {
      const totalRatings = location.user_ratings_total
        ? location.user_ratings_total
        : 0;

      if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[0])) {
        if (location.rating && Number(location.rating) > 4.4) {
          return location;
        } else {
          return 'test';
        }
      }
      if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[1])) {
        if (location.rating && Number(location.rating) > 4.5) {
          return location;
        } else {
          return 'test';
        }
      }
      if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[2])) {
        if (location.rating && Number(location.rating) > 4.6) {
          return location;
        } else {
          return 'test';
        }
      }
      if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[3])) {
        if (location.rating && Number(location.rating) > 4.7) {
          return location;
        } else {
          return 'test';
        }
      }
      if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[4])) {
        if (location.rating && Number(location.rating) > 4.8) {
          return location;
        } else {
          return 'test';
        }
      }
      if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[5])) {
        if (location.rating && Number(location.rating) > 4.9) {
          return location;
        } else {
          return 'test';
        }
      }
    });
  } else {
    return { status: 'Success', data: topLocations };
  }

  // If we reach here we need to combine the two arrays and check their length again
  const combinedTopLocations = topLocations.concat(extraTopLocations);

  if (combinedTopLocations.length < 100) {
    // we need to do another switch with even lower ratings
    // NOTE for testing purposes I want to return here to see how many locations we have usually after two swtiches
    console.log(
      'Still less than 100 after second switch',
      combinedTopLocations.length
    );

    return { status: 'Success', data: combinedTopLocations };
  } else {
    return { status: 'Success', data: combinedTopLocations };
  }
};
