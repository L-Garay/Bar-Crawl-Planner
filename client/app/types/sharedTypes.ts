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
  setClicks: React.Dispatch<React.SetStateAction<google.maps.LatLng[]>>;
  children?: React.ReactNode;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  mapOptions?: google.maps.MapOptions;
}

// NOTE is this considered bad practice? Really I just don't want to have to type out 'google.maps.GeocoderRequest' every time I want to use it
// and it allows me to extend in future if needed
// Only ever use ONE of either: address, location, or placeId. NEVER use two or more in the same request
export interface GeocoderRequest extends google.maps.GeocoderRequest {}
export interface GeocoderResult extends google.maps.GeocoderResult {}
