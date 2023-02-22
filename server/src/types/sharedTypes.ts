import jwt from 'jsonwebtoken';

export interface GoogleError extends Error {
  status: number;
  headers?: any;
}

export type PrismaError = {
  meta?: Record<any, unknown>;
  errorCode?: string;
} & Error;

export type QueryError = PrismaError | Error | GoogleError;

export type QueryData = {
  status: 'Success' | 'Failure';
  data: any;
  error?: QueryError;
};

export type TokenValidationResponse = {
  status: number;
  error?: jwt.VerifyErrors | Error;
  decoded?: jwt.JwtPayload | string;
};

export type CitySelectOptions =
  | 'Boise'
  | 'Denver'
  | 'Portland'
  | 'Seattle'
  | 'Slc';

// This is the data being sent to the DB, so there should not be an id
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

export type OutingInput = {
  name: string;
  created_at: string;
  start_date_and_time: string;
  place_ids: string[];
};

export type SendingOutingsInvitesInput = {
  outing_id: number;
  emails: string[];
  start_date_and_time: string;
  senderName: string;
};

export type OutingInviteProfiles = {
  id: number;
  name: string;
  social_pin: string;
};

export type GenerateOutingInviteEmailParams = {
  outing_id: number;
  start_date_and_time: string;
  profiles: OutingInviteProfiles[];
  senderName: string;
};

export type OutingInviteEmail = {
  body: {
    name: string;
    intro: string;
    action: {
      instructions: string;
      button: {
        color: string;
        text: string;
        link: string;
      };
    };
    outro: string;
  };
};
