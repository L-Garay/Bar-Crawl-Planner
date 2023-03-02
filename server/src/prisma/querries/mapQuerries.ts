import dotenv from 'dotenv';
import {
  CITY_COORDINATES,
  CRON_JOB_DATA,
  DETAILS_FIELDS_TO_RETURN,
  LOCATION_DATA_EXPIRATION_DAYS,
  LOCATION_FILTER_NAMES,
  LOCATION_FILTER_TYPES,
  NEARBY_CITIES,
  TOTAL_RATINGS_CUTOFFS,
} from '../../constants/mapConstants';
import {
  CitySelectOptions,
  GoogleError,
  LocationDetails,
  PrismaError,
} from '../../types/sharedTypes';
import prismaClient from '../../index';
import { PrismaData } from '../../types/sharedTypes';
import {
  Client,
  PlaceData,
  PlaceType2,
  TextSearchResponse,
} from '@googlemaps/google-maps-services-js';
import { Sleep } from '../../utilities/sleepFunction';

dotenv.config();

export const SearchCity = async (
  city: CitySelectOptions,
  locationType: string
): Promise<PrismaData> => {
  const fullCityName = city === 'Slc' ? 'Salt Lake City' : city;

  // Get all known locations for the given search city and it's surrounding/nearby cities
  // sort by most rated to least
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
  // retunr an empty array if no locations are found, but not a failure
  // don't expect this to get hit at all, but just in case
  if (allLocationsInCity.length === 0) {
    // should probably log some sort of message here to let me/admin know that something might be wrong with locations
    return { status: 'Success', data: [], error: null };
  }

  // Filter the locations by name using location type first
  // I.e. if the location has the word 'pub' in their name, then those locations will be returned when the given locationType is 'pub'
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
  // apply the checkName function to each location
  const filteredLocationsByName = allLocationsInCity.filter((location) =>
    checkName(location)
  );

  // Check location's total ratings
  // only grab those that meet certain crieteria
  const checkTotalRatings = (totalRatings: number, cutoff: number) => {
    if (totalRatings >= cutoff) {
      return true;
    } else {
      return false;
    }
  };
  // apply the checkTotalRatings function to each location
  const topLocations: any[] = filteredLocationsByName.map((location) => {
    const totalRatings = location.user_ratings_total
      ? location.user_ratings_total
      : 0;
    // locations with a certain amount of ratings, must have a certain average rating
    // the lower the total ratings, the higher the average must be
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
    // if a location hasn't been returned yet, then it doesn't meet the criteria and we don't want it
    // must return something, so we will return null
    return null;
  });

  // remove any nulls from the topLocations array
  const noNullTopLocations = topLocations.filter(
    (location) => location !== null
  ) as any[];

  // Find the index of each topLocation in allLocationsInCity and remove it
  // this will avoid duplicates when we itterate through the list again
  const indexArray: number[] = noNullTopLocations.map((location) =>
    allLocationsInCity.findIndex(
      (filteredLocation) => location.name === filteredLocation.name
    )
  );
  indexArray.forEach((index) => allLocationsInCity.splice(index, 1));

  // Now we will itterate through the allLocationsInCtiy, as we have now removed the topLocations that we already have
  // we will check the types and if they match, we will still check their average rating, and if they are good enough, we will add them to the extraTopLocations array

  // Filter locations by their types, given the locationType
  // The constant LOCATION_FILTER_TYPES is an object where the values are arrays of string of two types I think are most applicable to each locationType
  // likely not the best and will need to be itterated on
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

  // apply the checkType function to each location
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

  // combine the topLocations that matched name and the extraTopLocations that matched type
  const combinedTopLocations = noNullTopLocations.concat(
    noNullExtraTopLocations
  );

  // NOTE I'm not sure how it's even possible to have duplicates
  // since we are removing the topLocations from the allLocationsInCity array using their indexes WITHIN the allLocationsInCity array
  // which means it should be impossible for there to be duplicates of the topLocations when iterating through the allLocationsInCity the second time based on location type
  // if you console.log() the length of the allLocationsInCity array before and after removing the topLocations, you will see that the length does get smaller
  // therefore there should be literally no way for the second iteration to possibly add in a duplicate of a topLocation
  // however, the code below does the trick, just shouldn't have to do it IMO
  const locationSet = new Set(combinedTopLocations);
  const noDubplicatesArray = Array.from(locationSet);

  if (noDubplicatesArray.length < 60) {
    // NOTE at this point we would likely need to do another round with even lower ratings
    // for testing purposes I want to return here to see how many locations we have usually after two swtiches
    console.log(
      'Still less than 60 after second switch',
      noDubplicatesArray.length
    );
    return { status: 'Success', data: noDubplicatesArray, error: null };
  } else {
    return { status: 'Success', data: noDubplicatesArray, error: null };
  }
};

// NOTE most recent changes to this flow have not been tested yet against the google api
// NOTE most of the changes are in the GetLocationData function
export const GetGoogleLocations = async (searchParams: any, city: string) => {
  const googleClient = new Client({});

  // variable to hold all results
  let locationResults: Partial<PlaceData>[] = [];
  // FIRST PAGE
  // make call to google api with search params
  let response: TextSearchResponse = {} as TextSearchResponse;
  response = await googleClient.textSearch({
    params: searchParams,
    timeout: 5000,
  });

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
    console.log(
      `Error fetching first page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error.name} ${error.message}`
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
    console.log(
      `Error re-fetching first page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error.name} ${error.message}`
    );
    return { locationResults, error };
    // TODO ideally log this in some sort of monitoring service
  }

  // SECOND PAGE
  // repeat the same process for the second page of results
  let secondResponse: TextSearchResponse = {} as TextSearchResponse;
  if (response.data.next_page_token) {
    console.log('ABOUT TO GET SECOND PAGE');
    // it is known that Google imposes a 2sec delay between pagintation calls
    await Sleep(2000);

    secondResponse = await googleClient.textSearch({
      params: {
        ...searchParams,
        pagetoken: response.data.next_page_token,
      },
      timeout: 10000,
    });
  }
  if (
    (secondResponse.data && secondResponse.data.status === 'NOT_FOUND') ||
    secondResponse.data.status === 'ZERO_RESULTS' ||
    secondResponse.data.status === 'OVER_QUERY_LIMIT' ||
    secondResponse.data.status === 'REQUEST_DENIED'
  ) {
    // at this point we know the first request was successful
    // so return those results
    const error: GoogleError = {
      status: secondResponse.status,
      name: secondResponse.data.status,
      message: secondResponse.data.error_message,
    };
    console.log(
      `Error fetching second page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error.name} ${error.message}`
    );
    return { locationResults, error };
  } else if (
    (secondResponse.data && secondResponse.data.status === 'INVALID_REQUEST') ||
    secondResponse.data.status === 'UNKNOWN_ERROR'
  ) {
    await Sleep(2000);
    secondResponse = await googleClient.textSearch({
      params: searchParams,
      timeout: 10000,
    });
  } else if (secondResponse.data && secondResponse.data.status === 'OK') {
    locationResults.push(...secondResponse.data.results);
  }

  if (secondResponse.data.status !== 'OK') {
    const error: GoogleError = {
      name: secondResponse.data.status,
      status: secondResponse.status,
      message: secondResponse.data.error_message,
    };
    console.log(
      `Error re-fetching second page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error.name} ${error.message}`
    );
    return { locationResults, error };
    // TODO ideally log this in some sort of monitoring service
  }

  // THIRD PAGE
  let thirdResponse: TextSearchResponse = {} as TextSearchResponse;
  if (secondResponse.data && secondResponse.data.next_page_token) {
    console.log('ABOUT TO GET THIRD PAGE');
    await Sleep(2000);
    thirdResponse = await googleClient.textSearch({
      params: {
        ...searchParams,
        pagetoken: secondResponse.data.next_page_token,
      },
      timeout: 10000,
    });
  }

  if (
    (thirdResponse.data && thirdResponse.data.status === 'NOT_FOUND') ||
    thirdResponse.data.status === 'ZERO_RESULTS' ||
    thirdResponse.data.status === 'OVER_QUERY_LIMIT' ||
    thirdResponse.data.status === 'REQUEST_DENIED'
  ) {
    const error: GoogleError = {
      name: thirdResponse.data.status,
      status: thirdResponse.status,
      message: thirdResponse.data.error_message,
    };
    console.log(
      `Error fetching third page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error.name} ${error.message}`
    );
    return { locationResults, error };
  } else if (
    (thirdResponse.data && thirdResponse.data.status === 'INVALID_REQUEST') ||
    thirdResponse.data.status === 'UNKNOWN_ERROR'
  ) {
    await Sleep(2000);
    thirdResponse = await googleClient.textSearch({
      params: searchParams,
      timeout: 10000,
    });
  } else if (thirdResponse.data && thirdResponse.data.status === 'OK') {
    locationResults.push(...thirdResponse.data.results);
  }

  if (thirdResponse.data && thirdResponse.data.status !== 'OK') {
    const error: GoogleError = {
      name: thirdResponse.data.status,
      status: thirdResponse.status,
      message: thirdResponse.data.error_message,
    };
    console.log(
      `Error re-fetching third page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error.name} ${error.message}`
    );
    return { locationResults, error };
    // TODO ideally log this in some sort of monitoring service
  }

  // this will capture all results from the 3 pages if all requests are successful
  // otherwise, the second and third pages handle sending the known results if their requests fails

  return { locationResults, error: undefined };
};

export const GetLocationData = async (
  city: CitySelectOptions,
  locationType: string
): Promise<LocationDetails[]> => {
  const googleClient = new Client({});
  console.log('SEARCH PARAMS', city, locationType);

  // generate the search params for the Google Places API
  const searchParams = {
    query: locationType,
    location: {
      lat: CITY_COORDINATES[city].lat,
      lng: CITY_COORDINATES[city].lng,
    },
    radius: 8045, // 5 miles
    key: process.env.GOOGLE_MAPS_API_KEY!,
  };

  // get place search results from google and potential error
  const { locationResults, error } = await GetGoogleLocations(
    searchParams,
    city
  );

  // if there are locations, we need to get their details
  if (locationResults.length == 0 && error) {
    // if we log the error from GetGoogleLocations, what should we do here?
    console.error(error);
    return [];
  }
  if (locationResults.length == 0 && !error) {
    return [];
  }

  console.log('ABOUT TO FORMAT RESULTS');

  // iterate over the results and get the details for each location
  // format the results into a LocationDetails object
  const formattedTextSearchResults: Partial<LocationDetails | null>[] =
    locationResults.map((result) => {
      if (!result.place_id) {
        console.log('\nNO PLACE ID\n');

        return null;
      }
      // get the photo reference pointed to photo's storage location in google
      // attach the photo's width, height, and attributions to the reference
      const photoReferences = result.photos
        ? result.photos.map(
            (photo) =>
              photo.photo_reference +
              `&maxwidth=${photo.width}&maxheight=${
                photo.height
              }&attributions=${JSON.stringify(photo.html_attributions)}`
          )
        : [];
      // pull off the relevant text search result data
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
      return textSearchResult;
    });

  const formattedDetailResults: Promise<Partial<LocationDetails> | null>[] =
    locationResults.map(async (result) => {
      let detailsData;
      console.log('ABOUT TO FETCH DETAILS');
      // get the details for each location based on the place_id
      detailsData = await googleClient.placeDetails({
        params: {
          place_id: result.place_id!,
          fields: DETAILS_FIELDS_TO_RETURN,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
        timeout: 10000,
        timeoutErrorMessage: `Error fetching details for place: ${result.name}`,
      });
      console.log('JUST FETCHED DETAILS');

      // if the request status is one of these, there is no point in retrying at this time
      if (
        (detailsData.data && detailsData.data.status === 'NOT_FOUND') ||
        (detailsData.data && detailsData.data.status === 'ZERO_RESULTS') ||
        (detailsData.data && detailsData.data.status === 'OVER_QUERY_LIMIT') ||
        (detailsData.data && detailsData.data.status === 'REQUEST_DENIED')
      ) {
        console.log(
          `\n\nError fetching details with status: ${detailsData.data.status}\n\n`
        );
        console.log(`Error fetching details for place: ${result.place_id}`);
        return null;
      } else if (
        /* if the request status is one of these two, we can try to make another request. Although, I'm not sure what could be invalid for this simple request. */
        (detailsData.data && detailsData.data.status === 'INVALID_REQUEST') ||
        (detailsData.data && detailsData.data.status === 'UNKNOWN_ERROR')
      ) {
        console.log(
          '\n\nRETRYING FETCHING DETAILS\n\n',
          detailsData.data.status
        );

        detailsData = await googleClient.placeDetails({
          params: {
            place_id: result.place_id!,
            fields: DETAILS_FIELDS_TO_RETURN,
            key: process.env.GOOGLE_MAPS_API_KEY!,
          },
          timeout: 10000,
          timeoutErrorMessage: `Error fetching details for place: ${result.name}`,
        });
      }
      // if after the retry, the status is still not OK, we can't do anything with this result so we return null and log the error
      if (detailsData.data && detailsData.data.status !== 'OK') {
        const error: GoogleError = {
          status: detailsData.status,
          name: detailsData.data.status,
          message: detailsData.data.error_message,
        };
        console.log(
          '\n\nERROR RETRYING FETCHING DETAILS\n\n',
          detailsData.data.status
        );
        console.log(
          `Error re-fetching details for location: ${result.place_id}`
        );
        return null;
      }
      // this means there was no error getting the details
      const detailsResult = detailsData.data.result;

      //format the details data into a LocationDetails object compatible structure
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
      console.log('JUST FORMATTED DETAILS');
      return formattedDetailsResponse;
    });

  console.log('ABOUT TO FILTER RESOLVED FORMATTED RESULTS');
  const filteredFormattedTextSearchResults = formattedTextSearchResults.filter(
    (result) => result !== null
  ) as LocationDetails[];

  const resolvedFormattedDetailResults = await Promise.all(
    formattedDetailResults
  );
  const filteredResolvedFormattedDetailResults =
    resolvedFormattedDetailResults.filter(
      (result) => result !== null
    ) as LocationDetails[];

  // combine the text search result and the details result into a single LocationDetails object
  const combinedFormattedResults = filteredFormattedTextSearchResults.map(
    (result, index) => {
      return {
        ...result,
        ...filteredResolvedFormattedDetailResults[index],
        expiration_date: new Date(
          new Date().getTime() +
            LOCATION_DATA_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
        ).toISOString(),
      };
    }
  );

  // const formattedFinalResult: LocationDetails = {
  //   ...formattedTextSearchResults,
  //   ...formattedDetailResults,
  //   expiration_date: new Date(
  //     new Date().getTime() +
  //       LOCATION_DATA_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
  //   ).toISOString(),
  // };
  // not sure Promise.all() is needed?
  // const resolvedFormattedResults = await Promise.all(combinedFormattedResults);

  console.log('ABOUT TO RETURN FILTERED RESOLVED FORMATTED RESULTS');
  return combinedFormattedResults;
};

export const SaveLocationsToDB = async () => {
  const { cities, querries } = CRON_JOB_DATA;

  const allQueryCombos = cities.flatMap((city) => {
    return querries.map((query) => {
      const typedCity = city as CitySelectOptions;
      return { typedCity, query };
    });
  });

  await Promise.allSettled(
    allQueryCombos.map(
      async (combo) => await GetLocationData(combo.typedCity, combo.query)
    )
  )
    .then(async (resultsArray) => {
      console.log('DELETING ALL RECORDS');
      // await prismaClient.locationDetails.deleteMany();
      let allLocationResults: LocationDetails[] = [];
      resultsArray.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          allLocationResults.push(...promiseResult.value);
        }
      });
      try {
        const recordsCreated = await prismaClient.locationDetails.createMany({
          data: allLocationResults.length ? allLocationResults : [],
          skipDuplicates: true,
        });
        console.log('SAVED TO DB', recordsCreated);
      } catch (error) {
        console.log(`Error saving to DB: ${error}`);
      }

      process.exit(0);
    })
    .catch((error) => {
      console.log(`\n\nERROR: ${error}\n\n`);
      process.exit(1);
    });
};

// TODO set up quotas to limit requests to google apis in google cloud dashboard
// NOTE uncomment this out for testing/as needed
// SaveLocationsToDB();
