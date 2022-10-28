import {
  GetAllOutings,
  GetAllUsersWithOutings,
} from './prisma/testPrismaQuerries';

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    basicUsers: () => GetAllUsersWithOutings().then((users) => users),
    basicOutings: () => GetAllOutings().then((outings) => outings),
  },
};

export default resolvers;
