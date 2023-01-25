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
  children?: React.ReactNode;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  mapOptions?: google.maps.MapOptions;
}
