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
        account {
          email_verified
        }
      }
      pending_profiles {
        id
        name
        social_pin
        account {
          email_verified
        }
      }
    }
  }
`;

export const GET_ALL_FRIENDSHIPS = gql`
  query getAllFriendships {
    getAllFriendships {
      id
      requestor_profile_id
      addressee_profile_id
      status_code
      created_at
      requestor_profile_relation {
        id
        name
        account_Id
      }
      addressee_profile_relation {
        id
        name
        account_Id
      }
    }
  }
`;

export const GET_PROFILE = gql`
  query getProfile {
    getProfile {
      id
      name
      account_Id
      blocked_profile_ids
    }
  }
`;

export const BLOCK_PROFILE = gql`
  mutation blockProfile($blocked_profile_id: Int!) {
    blockProfile(blocked_profile_id: $blocked_profile_id) {
      id
      name
      account_Id
      blocked_profile_ids
    }
  }
`;

export const UNBLOCK_PROFILE = gql`
  mutation unblockProfile($blocked_profile_id: Int!) {
    unblockProfile(blocked_profile_id: $blocked_profile_id) {
      id
      name
      account_Id
      blocked_profile_ids
    }
  }
`;

export const GET_BLOCKED_PROFILES = gql`
  query getBlockedProfiles {
    getBlockedProfiles {
      id
      name
      account_Id
      blocked_profile_ids
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

export const UPDATE_OUTING = gql`
  mutation updateOuting(
    $id: Int!
    $name: String
    $start_date_and_time: String
  ) {
    updateOuting(
      id: $id
      name: $name
      start_date_and_time: $start_date_and_time
    ) {
      id
      name
      creator_profile_id
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
      accepted_profiles {
        id
        name
        account_Id
      }
      pending_profiles {
        id
        name
        account_Id
      }
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

export const SEND_OUTING_INVITES_AND_CREATE = gql`
  mutation sendOutingInvitesAndCreate(
    $outing_id: Int!
    $start_date_and_time: String!
    $emails: [String!]!
  ) {
    sendOutingInvitesAndCreate(
      outing_id: $outing_id
      start_date_and_time: $start_date_and_time
      emails: $emails
    )
  }
`;

export const SEND_OUTING_INVITES = gql`
  mutation sendOutingInvites(
    $outing_id: Int!
    $start_date_and_time: String!
    $account_Ids: [Int!]!
    $outing_name: String!
  ) {
    sendOutingInvites(
      outing_id: $outing_id
      start_date_and_time: $start_date_and_time
      account_Ids: $account_Ids
      outing_name: $outing_name
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

export const GET_CREATED_AND_JOINED_OUTINGS = gql`
  query outings {
    getCreatedOutings {
      id
      name
      creator_profile_id
      created_at
      start_date_and_time
      place_ids
    }
    getJoinedOutings {
      id
      name
      creator_profile_id
      created_at
      start_date_and_time
      place_ids
    }
  }
`;

export const GET_SENT_FRIEND_REQUESTS = gql`
  query getSentFriendRequests {
    getSentFriendRequests {
      id
      addressee_profile_id
      requestor_profile_id
      created_at
    }
  }
`;

export const GET_RECIEVED_FRIEND_REQUESTS = gql`
  query getRecievedFriendRequests {
    getRecievedFriendRequests {
      id
      addressee_profile_id
      requestor_profile_id
      created_at
    }
  }
`;

export const GET_RECIEVED_FRIEND_REQUEST_COUNT = gql`
  query getRecievedFriendRequestCount {
    getRecievedFriendRequestCount
  }
`;

export const SEND_OUTING_JOINED_EMAIL = gql`
  mutation sendOutingJoinedEmail($outing_id: Int!) {
    sendOutingJoinedEmail(outing_id: $outing_id)
  }
`;

export const SEND_FRIEND_REQUEST = gql`
  mutation sendFriendRequestEmail($addressee_profile_id: Int!) {
    sendFriendRequestEmail(addressee_profile_id: $addressee_profile_id)
  }
`;

export const UPDATE_FRIEND = gql`
  mutation updateFriend($friendship_id: Int!, $status_code: String!) {
    updateFriend(friendship_id: $friendship_id, status_code: $status_code) {
      id
      requestor_profile_id
      addressee_profile_id
      created_at
      status_code
      last_modified_by
      modified_at
    }
  }
`;
