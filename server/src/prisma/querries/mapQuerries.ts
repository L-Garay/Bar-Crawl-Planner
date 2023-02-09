import dotenv from 'dotenv';
import {
  LOCATION_FILTER_NAMES,
  LOCATION_FILTER_TYPES,
  NEARBY_CITIES,
  TOTAL_RATINGS_CUTOFFS,
} from '../../constants/mapConstants';
import { CitySelectOptions } from '../../types/sharedTypes';
import { GetPrismaError } from '../../utilities';
import { prismaClient } from '../../index';
import { QueryData } from '../../types/sharedTypes';
import { Prisma } from '@prisma/client';

dotenv.config();

export const SearchCity = async (
  city: CitySelectOptions,
  locationType: string
): Promise<QueryData> => {
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
    const newError = GetPrismaError(error);
    return { status: 'Error', data: null, error: newError };
  }

  if (allLocationsInCity.length === 0) {
    return { status: 'Success', data: [] };
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
  console.log('combinedTopLocations', combinedTopLocations.length);

  if (combinedTopLocations.length < 60) {
    // at this point we would likely need to do another round with even lower ratings
    // NOTE for testing purposes I want to return here to see how many locations we have usually after two swtiches
    console.log(
      'Still less than 60 after second switch',
      combinedTopLocations.length
    );
    return { status: 'Success', data: combinedTopLocations };
  } else {
    return { status: 'Success', data: combinedTopLocations };
  }
};
