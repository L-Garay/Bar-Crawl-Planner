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
  }

  type Profile {
    id: Int
    name: String
    profile_img: String
    updated_at: String
    account: Account
    account_id: Int
    outings: [Outing]
  }

  type Outing {
    id: Int
    name: String
    profiles: [Profile]
    creator_profile_id: String 
    created_at: String
    start_date_and_time: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "basicUsers" query returns an array of zero or more BasicUsers (defined above).
  type Query {
    account: Account
    profile: Profile
    outing: Outing
    accounts: [Account]
    profiles: [Profile]
    outings: [Outing]
  }

  type Mutation {
    createAccount(email: String, email_verified: Boolean): Account
    createProfile(name: String, profile_img: String, account_id: Int): Profile
  }
`;

export default typeDefs;
