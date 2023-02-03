import Bull from 'bull';
import dotenv from 'dotenv';
import {
  Client,
  PlaceData,
  PlaceType2,
  TextSearchResponse,
} from '@googlemaps/google-maps-services-js';
import {
  CitySelectOptions,
  GoogleError,
  LocationDetails,
  QueryData,
} from '../types/sharedTypes';
import { GetPrismaError } from '../utilities';
import { prismaClient } from '..';
import {
  CITY_COORDINATES,
  CronJobData,
  DETAILS_FIELDS_TO_RETURN,
  LOCATION_DATA_EXPIRATION_DAYS,
} from '../constants/mapConstants';

dotenv.config();

const Sleep = async (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const testGoogleQueue = new Bull('Test Google Maps Queue', {
  redis: {
    host: process.env.REDIS_HOSTNAME,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_HOST_PASSWORD,
    username: process.env.REDIS_USERNAME,
  },
});

testGoogleQueue.process('Fetch all location data', async (job, done) => {
  const ExecuteSearch = async (searchParams: any, city: string) => {
    const googleClient = new Client({});

    // variable to hold all results
    let locationResults: Partial<PlaceData>[] = [];

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
        `Error fetching first page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error}`
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
        `Error re-fetching first page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error}`
      );
      return { locationResults, error };
      // TODO ideally log this in some sort of monitoring service
    }

    // repeat the same process for the second and third pages
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
        timeout: 5000,
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
        `Error fetching second page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error.message}`
      );
      return { locationResults, error };
    } else if (
      (secondResponse.data &&
        secondResponse.data.status === 'INVALID_REQUEST') ||
      secondResponse.data.status === 'UNKNOWN_ERROR'
    ) {
      await Sleep(2000);
      secondResponse = await googleClient.textSearch({
        params: searchParams,
        timeout: 5000,
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
        `Error re-fetching second page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error}`
      );
      return { locationResults, error };
      // TODO ideally log this in some sort of monitoring service
    }

    let thirdResponse: TextSearchResponse = {} as TextSearchResponse;
    if (secondResponse.data && secondResponse.data.next_page_token) {
      console.log('ABOUT TO GET THIRD PAGE');
      await Sleep(2000);
      thirdResponse = await googleClient.textSearch({
        params: {
          ...searchParams,
          pagetoken: secondResponse.data.next_page_token,
        },
        timeout: 5000,
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
        `Error fetching third page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error}`
      );
      return { locationResults, error };
    } else if (
      (thirdResponse.data && thirdResponse.data.status === 'INVALID_REQUEST') ||
      thirdResponse.data.status === 'UNKNOWN_ERROR'
    ) {
      await Sleep(2000);
      thirdResponse = await googleClient.textSearch({
        params: searchParams,
        timeout: 5000,
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
        `Error re-fetching third page of search results for city: ${city} and location type: ${searchParams.query}\nError: ${error}`
      );
      return { locationResults, error };
      // TODO ideally log this in some sort of monitoring service
    }

    // this will capture all results from the 3 pages if all requests are successful
    // otherwise, the second and third pages handle sending the known results if their requests fails

    return { locationResults, error: undefined };
  };

  // --------------------------------------------------------------

  const SearchCity = async (
    city: CitySelectOptions,
    locationType: string
  ): Promise<LocationDetails[] | null> => {
    const googleClient = new Client({});

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

    if (locationResults.length > 0) {
      console.log('ABOUT TO FORMAT RESULTS');

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
          console.log('ABOUT TO FETCH DETAILS');

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
            job.log(`Error fetching details for place: ${result.place_id}`);
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
            job.log(
              `Error re-fetching details for location: ${result.place_id}`
            );
            return Promise.resolve(null);
          }

          const detailsResult = detailsData.data.result;

          const openPeriods = detailsResult.opening_hours?.periods.map(
            (period) => JSON.stringify(period)
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
      const filteredResolvedFormattedResults = resolvedFormattedResults.filter(
        (result) => result !== null
      ) as LocationDetails[];

      return filteredResolvedFormattedResults;
    } else {
      return [];
    }
  };

  const { cities, querries } = job.data.data;

  const allQueryCombos: Record<string, CitySelectOptions>[] = cities.reduce(
    (acc: Record<string, string>[], city: CitySelectOptions) => {
      return acc.concat(
        querries.map((query: string) => {
          return { city, query };
        })
      );
    },
    []
  );

  Promise.all(
    allQueryCombos.map((combo) => SearchCity(combo.city, combo.query))
  )
    .then(async (results) => {
      console.log('RESOLVED FORMATTED RESULTS', results[0]);
      console.log(results.length);

      console.log('ABOUT TO SAVE TO DB');

      try {
        const recordsCreated = await prismaClient.locationDetails.createMany({
          data: results[0] ? results[0] : [],
          skipDuplicates: true,
        });
        done(null, recordsCreated);
      } catch (error) {
        const newError = GetPrismaError(error);
        console.log('ERROR', error.message);
        done(newError);
      }
    })
    .catch((error) => {
      job.log(`Job failed with error ${error.message}\nError: ${error}`);
    });
});

testGoogleQueue.on('completed', (job, result) => {
  console.log('job completed', result);
  job.log(`Job completed with result ${result}`);
});

testGoogleQueue.on('failed', (job, err) => {
  console.error('job failed', err);
  job.log(`Job failed with error ${err.message}\nError: ${err}`);
});

testGoogleQueue.on('stalled', (job) => {
  console.error('job stalled', job);
  testGoogleQueue.getJobLogs(job.id).then((logs) => {
    console.log('job logs', logs);
  });
});

testGoogleQueue.on('error', (error) => {
  console.error('QUEUE ERROR', error);
});

export const testGoogleJob = async () => {
  await testGoogleQueue.add(
    'Fetch all location data',
    { data: CronJobData },
    { attempts: 3, backoff: 1000, repeat: { cron: '00 1 * * 6' } }
  );
};
