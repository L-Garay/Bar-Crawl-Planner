import type { Session } from '@remix-run/node';

export type UserInfo = {
  name: string;
  email: string;
};

// TODO figure out how to properly type authData
export type AuthenticatorUser = {
  authData: any;
  info: UserInfo;
};

export type ValidationResponse = {
  valid: boolean;
  user: AuthenticatorUser | null;
  session: Session | null;
};

export interface MapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  setClicks?: React.Dispatch<React.SetStateAction<google.maps.LatLng[]>>;
  children?: React.ReactNode;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  mapOptions?: google.maps.MapOptions;
}

export type CitySelectOptions =
  | 'Boise'
  | 'Denver'
  | 'Portland'
  | 'Seattle'
  | 'Slc';

export type LocationSelectOptions =
  | 'bars'
  | 'breweries'
  | 'restaurants'
  | 'wineries'
  | 'taverns'
  | 'pubs';

// NOTE is this considered bad practice? Really I just don't want to have to type out 'google.maps.GeocoderRequest' every time I want to use it
// and it allows me to extend in future if needed
// Only ever use ONE of either: address, location, or placeId. NEVER use two or more in the same request
export interface GeocoderRequest extends google.maps.GeocoderRequest {}
export interface GeocoderResult extends google.maps.GeocoderResult {}
export interface PlaceResult extends google.maps.places.PlaceResult {}

// This is going to be the data that is returned from the DB
export type LocationDetails = {
  id: number;
  business_status?: string;
  formatted_address?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  html_attributions?: string;
  icon?: string;
  icon_mask_base_uri?: string;
  icon_background_color?: string;
  name?: string;
  place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  vicinity?: string;
  formatted_phone_number?: string;
  plus_compound_code?: string;
  plus_global_code?: string;
  open_periods?: string[];
  weekday_text?: string[];
  photos_references?: string[] | any[];
  reviews?: string[];
  url?: string;
  website?: string;
  utc_offset_minutes?: number;
  price_level?: number;
  expiration_date: string;
};
