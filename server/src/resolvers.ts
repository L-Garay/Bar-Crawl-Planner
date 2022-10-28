import {
  GetAllOutings,
  GetAllUsersWithOutings,
} from './prisma/testPrismaQuerries';
import { Resolvers } from './generated/graphqlTypes';

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers: Resolvers = {
  Query: {
    basicUsers: GetAllUsersWithOutings,
    basicOutings: GetAllOutings,
  },
};

export default resolvers;
