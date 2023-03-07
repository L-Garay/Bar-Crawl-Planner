// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  
  type Account {
    id: Int
    email: String
    email_verified: Boolean
    created_at: String
    profile: Profile
    deactivated: Boolean
    deactivated_at: String
    phone_number: String
  }

  type Profile {
    id: Int
    name: String
    profile_img: String
    updated_at: String
    account: Account
    account_id: Int
    accepted_outings: [Outing]
    pending_outings: [Outing]
    declined_outings: [Outing]
    social_pin: String
    friends: [Profile]
    friendsRelation: [Profile]
  }

  type Outing {
    # TODO don't like the idea of using the very simple/small/easily guessable/targetabble outing id that is assigned by the database
    # we should look to use a more secure id like using crypto.randomUUID()
    # with regards to accessing a specific outing by id in the url
    id: Int
    name: String
    accepted_profiles: [Profile]
    pending_profiles: [Profile]
    declined_profiles: [Profile]
    creator_profile_id: String 
    created_at: String
    start_date_and_time: String
    place_ids: [String]
  }

  type OutingProfileStates {
    accepted_profiles: [Profile]
    pending_profiles: [Profile]
    declined_profiles: [Profile]
  }

  type LocationDetails {
    id: Int
    business_status: String
    formatted_address: String
    city: String
    state: String
    lat: Float
    lng: Float
    # the Google Maps Services Node Client does not return any html_attributions for a place search (or even a photo search FFS)
    # but if we ever do get them, we will just concatenate them into a single string
    html_attributions: String
    icon: String
    icon_mask_base_uri: String
    icon_background_color: String
    # NOTE this warning comes straight from Google's API documentation
    # Note: In the case of user entered Places, this is the
    # raw text, as typed by the user. Please exercise caution when using this
    # data, as malicious users may try to use it as a vector for code injection
    # attacks 
    name: String
    place_id: String
    rating: Float
    user_ratings_total: Int
    types: [String]
    vicinity: String
    formatted_phone_number: String
    plus_compound_code: String
    plus_global_code: String
    # For this, we will take the 7 individual day objects and JSON.stringify() them
    # Then we will store them in the database as an array of strings
    # Then we will parse them back into objects when we need them
    open_periods: [String]
    # This will already be formatted, and can be localized
    # However it seems we can't control exactly how it will be formatted, so we'll need open_periods if we want to display it differently
    weekday_text: [String]
    photos_references: [String]
    # Same as the open_periods data, we will take each review object and serialize it into a string, upload to DB, and the parse as needed
    reviews: [String]
    url: String
    website: String
    utc_offset_minutes: Float
    price_level: Int
    # This will be the date that each object will need to be refreshed/refetched
    expiration_date: String
  }

  type Friendship {
    requester_profile_id: Int
    addressee_profile_id: Int
    created_at: String
  }

  type FriendshipStatus {
    status_code: String
    created_at: String
    requester_profile_id: Int
    addressee_profile_id: Int
    modifier_profile_id: Int
  }

  type Notification {
    sender_profile_id: Int
    recipient_profile_id: Int
    created_at: String
    notification_type_code: String
    notification_status_code: String
    requires_action: Boolean
    action_taken: Boolean
    title: String
    message: String
  }

  type NotificationStatus {
    status_code: String
    created_at: String
    sender_profile_id: Int
    recipient_profile_id: Int
    modifier_profile_id: Int
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "basicUsers" query returns an array of zero or more BasicUsers (defined above).
  type Query {
    getAccountByEmail(email: String!): Account
    getUserAccount: Account
    profile: Profile
    getProfilesInOuting(id: Int!): OutingProfileStates
    getOuting(id: Int!): Outing
    accounts: [Account]
    profiles: [Profile]
    getAllOutings: [Outing]
    searchCity(city: String!, locationType: String!): [LocationDetails]
    getAccountWithProfileData(email: String!): Account
  }

  type Mutation {
    createAccount(email: String, email_verified: Boolean): Account
    createProfile(name: String, profile_img: String, account_id: Int): Profile
    updateUserAccount(email: String, phone_number: String): Account
    deactivateUserAccount(id: Int!): Account
    createOuting(
    name: String
    created_at: String
    start_date_and_time: String
    place_ids: [String]
    ): Outing
    updateOuting(id: Int!, name: String, start_date_and_time: String): Outing
    deleteOuting(id: Int!): String
    sendOutingInvites(outing_id: Int!, start_date_and_time: String!, emails: [String!]!): String
    ConnectUserWithOuting(outing_id: Int!, profile_id: Int!): Outing
    DisconnectUserWithOuting(outing_id: Int!, profile_id: Int!): Outing
    UpdateAccountBySocialPin(profile_id: Int!, social_pin: String!, email: String!): Account
    CreateAccountAndProfile(name: String!, picture: String!, email: String!, verified: Boolean!): String
    generateOutingNotification( outing_id: Int!): String

  }
`;

export default typeDefs;
