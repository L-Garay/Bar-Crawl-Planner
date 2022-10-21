import { GetAllOutings, GetAllUsers } from 'prisma/testPrismaQuerries';

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    basicUsers: () => GetAllUsers,
    basicOutings: () => GetAllOutings,
  },
};

export default resolvers;
