import jwt from 'jsonwebtoken';

export type QueryData = {
  status: string;
  data: any;
  error?: PrismaError;
};

export type PrismaError = {
  clientVersion: string;
  meta: Record<any, unknown>;
} & Error;

export type TokenValidationResponse = {
  status: number;
  error?: jwt.VerifyErrors | Error;
  decoded?: jwt.JwtPayload | string;
};

export type CitySelectOptions =
  | 'boise'
  | 'denver'
  | 'portland'
  | 'seattle'
  | 'slc';

export type LocationDetails = {
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
