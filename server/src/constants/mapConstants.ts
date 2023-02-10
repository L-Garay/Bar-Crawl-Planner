export const CITY_COORDINATES = {
  Boise: {
    lat: 43.6141397,
    lng: -116.2155451,
  },
  Denver: {
    lat: 39.7465108,
    lng: -104.9968927,
  },
  Slc: {
    lat: 40.762807,
    lng: -111.9084849,
  },
  Portland: {
    lat: 45.5142438,
    lng: -122.6879714,
  },
  Seattle: {
    lat: 47.6053827,
    lng: -122.3530897,
  },
};

export const LOCATION_DATA_EXPIRATION_DAYS = 3;
export const DETAILS_FIELDS_TO_RETURN = [
  'reviews',
  'url',
  'website',
  'price_level',
  'utc_offset',
  'opening_hours',
  'vicinity',
  'formatted_phone_number',
  'address_components',
];
export const CRON_JOB_DATA = {
  querries: ['bars', 'taverns', 'breweries', 'wineries', 'restaurants', 'pubs'],
  cities: ['Denver', 'Boise', 'Slc', 'Portland', 'Seattle'],
};

export const LOCATION_FILTER_NAMES = {
  bars: ['bar'],
  taverns: ['tavern'],
  breweries: ['brew'],
  wineries: ['wine', 'vine'],
  restaurants: ['restaurant', 'eat', 'grill'],
  pubs: ['pub'],
};

export const LOCATION_FILTER_TYPES = {
  bars: ['bar', 'night_club'],
  taverns: ['bar', 'food'],
  breweries: ['liquor_store', 'bar'],
  wineries: ['liquor_store', 'point_of_interest'],
  restaurants: ['restaurant', 'bar'],
  pubs: ['bar', 'food'],
};

export const TOTAL_RATINGS_CUTOFFS = [2000, 1000, 100];

export const RATINGS_VALUE_CUTOFFS = {
  2000: 4.5,
  1500: 4.6,
  1000: 4.7,
  500: 4.8,
  100: 4.9,
  50: 5,
};

export const NEARBY_CITIES = {
  Boise: ['Garden City', 'Meridian', 'Eagle'],
  Denver: ['Edgewater', 'Lakewood', 'Wheat Ridge'],
  Slc: ['South Salt Lake', 'Murray', 'Millcreek'],
  Portland: ['Vancouver', 'Milwaukie', 'Beaverton'],
  // TODO don't like this, will need to refactor the mapQuerries code to handle locations with no nearby cities
  Seattle: ['Seattle', 'Seattle', 'Seattle'],
};
