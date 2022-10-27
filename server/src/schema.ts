// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "BasicUser" type defines the queryable fields for every user in our data source.
  type BasicUser {
    name: String
    outings: [BasicOuting]
  }

  type BasicOuting {
    name: String
    creator_id: Int
    created_at: String
    users: [BasicUser]
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "basicUsers" query returns an array of zero or more BasicUsers (defined above).
  type Query {
    basicUsers: [BasicUser]
    basicOutings: [BasicOuting]
  }
`;

export default typeDefs;
