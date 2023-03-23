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

export const ADD_FRIEND = gql`
  mutation addFriend($requestor_profile_id: Int!, $addressee_profile_id: Int!) {
    addFriend(
      requestor_profile_id: $requestor_profile_id
      addressee_profile_id: $addressee_profile_id
    ) {
      requestor_profile_id
      addressee_profile_id
      created_at
    }
  }
`;

export const GET_ALL_FRIENDSHIPS = gql`
  query getAllFriendships {
    getAllFriendships {
      id
      requestor_profile_id
      addressee_profile_id
      frienshipStatus_friendship_relation {
        status_code
        modifier_profile_id
        created_at
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

// ------------------- Notifications -------------------

export const GENERATE_OUTING_NOTIFICATIONS = gql`
  mutation generateOutingNotification($outing_id: Int!) {
    generateOutingNotification(outing_id: $outing_id) {
      addressee_profile_id
      created_at
      type_code
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query getAllNotifications {
    getAllNotifications {
      id
      sender_profile_id
      addressee_profile_id
      created_at
      type_code
      outing_id
      notification_relation {
        id
        status_code
        notification_created_at
        modifier_profile_id
        modified_at
      }
      notification_addressee_relation {
        id
        name
        profile_img
      }
      notification_sender_relation {
        id
        name
        profile_img
      }
    }
  }
`;

export const GET_NEW_NOTIFICATIONS_COUNT = gql`
  query getNewNotificationCount {
    getNewNotificationCount
  }
`;

export const GET_SENT_FRIEND_REQUESTS = gql`
  query getSentFriendRequests {
    getSentFriendRequests {
      id
      addressee_profile_id
      sender_profile_id
      created_at
    }
  }
`;

export const GET_FRIENDSHIP_STATUS = gql`
  query getFriendshipStatus($target_id: Int!) {
    getFriendshipStatus(target_id: $target_id) {
      status_code
    }
  }
`;

export const GET_FRIEND_REQUESTS = gql`
  query getFriendRequests {
    getFriendRequests {
      id
      addressee_profile_id
      sender_profile_id
      created_at
    }
  }
`;

export const GENERATE_FRIEND_REQUEST = gql`
  mutation generateFriendRequest($addressee_profile_id: Int!) {
    generateFriendRequest(addressee_profile_id: $addressee_profile_id) {
      id
      addressee_profile_id
      created_at
      type_code
      notification_addressee_relation {
        id
        name
        profile_img
      }
    }
  }
`;

export const GENERATE_FRIEND_STATUS = gql`
  mutation generateFriendStatus(
    $requestor_profile_id: Int!
    $addressee_profile_id: Int!
    $status_code: String!
  ) {
    generateFriendStatus(
      requestor_profile_id: $requestor_profile_id
      addressee_profile_id: $addressee_profile_id
      status_code: $status_code
    ) {
      requestor_profile_id
      addressee_profile_id
      status_code
      created_at
    }
  }
`;

export const GENERATE_FRIEND_NOTIFICATION = gql`
  mutation generateFriendNotification(
    $sender_profile_id: Int!
    $addressee_profile_id: Int!
    $type_code: String!
  ) {
    generateFriendNotification(
      sender_profile_id: $sender_profile_id
      addressee_profile_id: $addressee_profile_id
      type_code: $type_code
    ) {
      id
      addressee_profile_id
      type_code
      created_at
      notification_addressee_relation {
        id
        name
      }
    }
  }
`;

export const GENERATE_NOTIFICATION_STATUS = gql`
  mutation generateNotificationStatus(
    $type_code: String!
    $status_code: String!
    $created_at: String!
    $id: Int!
  ) {
    generateNotificationStatus(
      type_code: $type_code
      status_code: $status_code
      created_at: $created_at
      id: $id
    ) {
      modifier_profile_id
      status_code
      type_code
      notification_created_at
      modified_at
    }
  }
`;

export const OPEN_NOTIFICATION = gql`
  mutation openNotification(
    $type_code: String!
    $notification_created_at: String!
    $id: Int!
  ) {
    openNotification(
      type_code: $type_code
      notification_created_at: $notification_created_at
      id: $id
    ) {
      modifier_profile_id
      status_code
      type_code
      notification_created_at
      modified_at
    }
  }
`;

export const DECLINE_FRIEND_REQUEST = gql`
  mutation declineFriendRequest(
    $notification_id: Int!
    $notification_created_at: String!
  ) {
    declineFriendRequest(
      notification_id: $notification_id
      notification_created_at: $notification_created_at
    ) {
      modifier_profile_id
      status_code
      type_code
      notification_created_at
      modified_at
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation acceptFriendRequest(
    $sender_profile_id: Int!
    $addressee_profile_id: Int!
    $notification_created_at: String!
    $notification_id: Int!
  ) {
    acceptFriendRequest(
      sender_profile_id: $sender_profile_id
      addressee_profile_id: $addressee_profile_id
      notification_created_at: $notification_created_at
      notification_id: $notification_id
    ) {
      modifier_profile_id
      status_code
      type_code
      notification_created_at
      modified_at
    }
  }
`;
