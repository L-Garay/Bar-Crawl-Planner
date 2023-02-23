import dotenv from 'dotenv';
import {
  LOCATION_FILTER_NAMES,
  LOCATION_FILTER_TYPES,
  NEARBY_CITIES,
  TOTAL_RATINGS_CUTOFFS,
} from '../../constants/mapConstants';
import { CitySelectOptions, PrismaError } from '../../types/sharedTypes';

import prismaClient from '../../index';
import { PrismaData } from '../../types/sharedTypes';

dotenv.config();

export const SearchCity = async (
  city: CitySelectOptions,
  locationType: string
): Promise<PrismaData> => {
  const fullCityName = city === 'Slc' ? 'Salt Lake City' : city;

  let allLocationsInCity: any[] = [];
  try {
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
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }

  if (allLocationsInCity.length === 0) {
    return { status: 'Success', data: [], error: null };
  }

  // Filter the locations by name using location type first
  const checkName = (location: any) => {
    const nameIncludesType = LOCATION_FILTER_NAMES[
      locationType as keyof typeof LOCATION_FILTER_NAMES
    ].some((term) => {
      return location.name?.toLowerCase().includes(term);
    });

    if (nameIncludesType) {
      return true;
    } else {
      return false;
    }
  };

  const filteredLocationsByName = allLocationsInCity.filter((location) =>
    checkName(location)
  );

  // Check location's total ratings and average rating
  // only grab those that meet certain crieteria
  const checkTotalRatings = (totalRatings: number, cutoff: number) => {
    if (totalRatings >= cutoff) {
      return true;
    } else {
      return false;
    }
  };

  const topLocations: any[] = filteredLocationsByName.map((location) => {
    const totalRatings = location.user_ratings_total
      ? location.user_ratings_total
      : 0;

    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[0])) {
      if (location.rating && Number(location.rating) >= 4.0) {
        return location;
      }
    }
    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[1])) {
      if (location.rating && Number(location.rating) >= 4.2) {
        return location;
      }
    }
    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[2])) {
      if (location.rating && Number(location.rating) >= 4.4) {
        return location;
      }
    }
    return null;
  });

  // First we will find the index of each topLocation in allLocationsInCity and remove it
  // this will avoid duplicates when we itterate through the list again

  const noNullTopLocations = topLocations.filter(
    (location) => location !== null
  ) as any[];

  const indexArray: number[] = noNullTopLocations.map((location) =>
    allLocationsInCity.findIndex(
      (filteredLocation) => location.name === filteredLocation.name
    )
  );

  indexArray.forEach((index) => allLocationsInCity.splice(index, 1));

  // Now we will itterate through the allLocationsInCtiy, as we have now removed the topLocations that we already have
  // we will check the types and if they match, we will still check their average rating, and if they are good enough, we will add them to the extraTopLocations array

  const checkType = (location: any) => {
    const typesIncludesType = LOCATION_FILTER_TYPES[
      locationType as keyof typeof LOCATION_FILTER_TYPES
    ].some((locationType) => {
      return location.types?.some((type: string) => type === locationType);
    });

    if (typesIncludesType) {
      return true;
    } else {
      return false;
    }
  };

  const filteredLocationsByType = allLocationsInCity.filter((location) =>
    checkType(location)
  );

  // Itterate through the filteredLocationsByType array and perform same rating check
  const extraTopLocations: any[] = filteredLocationsByType.map((location) => {
    const totalRatings = location.user_ratings_total
      ? location.user_ratings_total
      : 0;

    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[0])) {
      if (location.rating && Number(location.rating) >= 4.0) {
        return location;
      }
    }
    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[1])) {
      if (location.rating && Number(location.rating) >= 4.2) {
        return location;
      }
    }
    if (checkTotalRatings(totalRatings, TOTAL_RATINGS_CUTOFFS[2])) {
      if (location.rating && Number(location.rating) >= 4.4) {
        return location;
      }
    }
    return null;
  });

  const noNullExtraTopLocations = extraTopLocations.filter(
    (location) => location !== null
  ) as any[];

  const combinedTopLocations = noNullTopLocations.concat(
    noNullExtraTopLocations
  );

  // NOTE I'm not sure how it's even possible to have duplicates
  // since we are removing the topLocations from the allLocationsInCity array using their indexes WITHIN the allLocationsInCity array
  // which means it should be impossible for there to be duplicates of the topLocations when iterating through the allLocationsInCity the second time based on location type
  // if you console.log() the length of the allLocationsInCity array before and after removing the topLocations, you will see that the length does get smaller
  // therefore there should be literally no way for the second iteration to possibly add in a duplicate of a topLocation
  // however, the code below does the trick, just shouldn't have to do it IMO

  const testSet = new Set(combinedTopLocations);
  const noDubplicatesArray = Array.from(testSet);

  if (noDubplicatesArray.length < 60) {
    // at this point we would likely need to do another round with even lower ratings
    // NOTE for testing purposes I want to return here to see how many locations we have usually after two swtiches
    console.log(
      'Still less than 60 after second switch',
      noDubplicatesArray.length
    );
    return { status: 'Success', data: noDubplicatesArray, error: null };
  } else {
    return { status: 'Success', data: noDubplicatesArray, error: null };
  }
};
