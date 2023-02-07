export const CITY_COORDINATES = {
  boise: {
    lat: 43.6141397,
    lng: -116.2155451,
  },
  denver: {
    lat: 39.7465108,
    lng: -104.9968927,
  },
  slc: {
    lat: 40.762807,
    lng: -111.9084849,
  },
  portland: {
    lat: 45.5142438,
    lng: -122.6879714,
  },
  seattle: {
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
  cities: ['denver', 'boise', 'slc', 'portland', 'seattle'],
};

export const LOCATION_FILTER_TERMS = {
  bars: ['bar'],
  taverns: ['tavern'],
  breweries: ['brew'],
  wineries: ['wine', 'vine'],
  restaurants: ['restaurant', 'eat', 'grill'],
  pubs: ['pub'],
};
