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
    outings: [Outing]
    social_pin: String
    friends: [Profile]
    friendsRelation: [Profile]
  }

  type Outing {
    id: Int
    name: String
    profiles: [Profile]
    creator_profile_id: String 
    created_at: String
    start_date_and_time: String
  }

  type PlaceResult {
    id: Int
    business_status: String
    formatted_address: String
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
    # For photos, the google maps API returns a blob object; which we will store in the DB using the Bytes type for Prisma
    # however we can read the contents of the blobs and convert them to strings before sending the data to the client
    # NOTE there is no built in/easy way to send byte data through GraphQL, so we'd have to do this transformation on the server anyway
    photos: [String]
    # Same as the open_periods data, we will take each review object and serialize it into a string, upload to DB, and the parse as needed
    reviews: [String]
    url: String
    website: String
    utc_offset_minutes: Float
    price_level: Int
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "basicUsers" query returns an array of zero or more BasicUsers (defined above).
  type Query {
    getAccountByEmail(email: String!): Account
    getUserAccount: Account
    profile: Profile
    outing: Outing
    accounts: [Account]
    profiles: [Profile]
    outings: [Outing]
    getAllFriends: [Profile]
    findFriendById(id: Int!): Profile
    findFriendByPin(social_pin: String!): Profile
  }

  type Mutation {
    createAccount(email: String, email_verified: Boolean): Account
    createProfile(name: String, profile_img: String, account_id: Int): Profile
    updateUserAccount(email: String, phone_number: String): Account
    deactivateUserAccount(id: Int!): Account
    addFriend(id: Int!, friend_id: Int!): Profile
    removeFriend(id: Int!, friend_id: Int!): Profile
  }
`;

export default typeDefs;
