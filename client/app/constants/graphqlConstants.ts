import { gql } from '@apollo/client';

// ------------------- Accounts -------------------
export const GET_ACCOUNT = gql`
  query getUserAccount {
    getUserAccount {
      email
      email_verified
      phone_number
      created_at
      deactivated
      id
    }
  }
`;

export const GET_ACCOUNT_BY_EMAIL = gql`
  query getAccountByEmail($email: String!) {
    getAccountByEmail(email: $email) {
      id
      email
    }
  }
`;

export const GET_ACCOUNT_WITH_PROFILE_DATA = gql`
  query getAccountWithProfileData($email: String!) {
    getAccountWithProfileData(email: $email) {
      id
      email
      profile {
        name
        id
      }
    }
  }
`;

export const UPDATE_ACCOUNT = gql`
  mutation updateUserAccount($email: String, $phone_number: String) {
    updateUserAccount(email: $email, phone_number: $phone_number) {
      email
      phone_number
    }
  }
`;

export const UPDATE_ACCOUNT_BY_SOCIAL_PIN = gql`
  mutation UpdateAccountBySocialPin(
    $profile_id: Int!
    $social_pin: String!
    $email: String!
  ) {
    UpdateAccountBySocialPin(
      profile_id: $profile_id
      social_pin: $social_pin
      email: $email
    ) {
      id
      email
    }
  }
`;
// ------------------- Profiles -------------------
export const CREATE_ACCOUNT_AND_PROFILE = gql`
  mutation CreateAccountAndProfile(
    $name: String!
    $picture: String!
    $email: String!
    $verified: Boolean!
  ) {
    CreateAccountAndProfile(
      name: $name
      picture: $picture
      email: $email
      verified: $verified
    )
  }
`;

export const GET_PROFILES_IN_OUTING = gql`
  query getProfilesInOuting($id: Int!) {
    getProfilesInOuting(id: $id) {
      accepted_profiles {
        id
        name
        social_pin
      }
      pending_profiles {
        id
        name
        social_pin
      }
      declined_profiles {
        id
        name
        social_pin
      }
    }
  }
`;

// ------------------- Outings -------------------
export const CITY_SEARCH = gql`
  query searchCity($city: String!, $locationType: String!) {
    searchCity(city: $city, locationType: $locationType) {
      id
      business_status
      formatted_address
      city
      state
      lat
      lng
      html_attributions
      icon
      icon_mask_base_uri
      icon_background_color
      name
      place_id
      rating
      user_ratings_total
      types
      vicinity
      formatted_phone_number
      plus_compound_code
      plus_global_code
      open_periods
      weekday_text
      photos_references
      reviews
      url
      website
      utc_offset_minutes
      price_level
      expiration_date
    }
  }
`;

export const CREATE_OUTING = gql`
  mutation createOuting(
    $name: String!
    $created_at: String!
    $start_date_and_time: String!
    $place_ids: [String!]
  ) {
    createOuting(
      name: $name
      created_at: $created_at
      start_date_and_time: $start_date_and_time
      place_ids: $place_ids
    ) {
      id
      name
      creator_profile_id
      created_at
      start_date_and_time
      place_ids
    }
  }
`;

export const DELETE_OUTING = gql`
  mutation deleteOuting($id: Int!) {
    deleteOuting(id: $id)
  }
`;

export const CONNECT_PROFILE = gql`
  mutation ConnectUserWithOuting($outing_id: Int!, $profile_id: Int!) {
    ConnectUserWithOuting(outing_id: $outing_id, profile_id: $profile_id) {
      id
      name
    }
  }
`;

export const DISCONNECT_PROFILE = gql`
  mutation DisconnectUserWithOuting($outing_id: Int!, $profile_id: Int!) {
    DisconnectUserWithOuting(outing_id: $outing_id, profile_id: $profile_id) {
      id
      name
    }
  }
`;

export const GET_OUTING = gql`
  query getOuting($id: Int!) {
    getOuting(id: $id) {
      id
      name
      creator_profile_id
      created_at
      start_date_and_time
      place_ids
    }
  }
`;

export const SEND_OUTING_EMAIL = gql`
  mutation sendOutingInvites(
    $outing_id: Int!
    $start_date_and_time: String!
    $emails: [String!]!
  ) {
    sendOutingInvites(
      outing_id: $outing_id
      start_date_and_time: $start_date_and_time
      emails: $emails
    )
  }
`;

export const GET_OUTINGS = gql`
  query getAllOutings {
    getAllOutings {
      id
      name
      creator_profile_id
      created_at
      start_date_and_time
      place_ids
    }
  }
`;
