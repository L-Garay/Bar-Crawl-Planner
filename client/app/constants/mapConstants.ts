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

export const LOCATION_TYPES = {
  bars: 'bars',
  taverns: 'taverns',
  breweries: 'breweries',
  wineries: 'wineries',
  restaurants: 'restaurants',
  pubs: 'pubs',
  hotels: 'hotel bars',
};

export const ALL_LOCATION_PROPERTIES = [
  'id',
  'business_status',
  'formatted_address',
  'city',
  'state',
  'lat',
  'lng',
  'html_attributions',
  'icon',
  'icon_mask_base_uri',
  'icon_background_color',
  'name',
  'place_id',
  'rating',
  'user_ratings_total',
  'types',
  'main_type',
  'vicinity',
  'formatted_phone_number',
  'plus_compound_code',
  'plus_global_code',
  'open_periods',
  'weekday_text',
  'photos',
  'reviews',
  'url',
  'website',
  'utc_offset_minutes',
  'price_level',
  'expiration_date',
];
