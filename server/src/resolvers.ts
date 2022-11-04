import { GetAllOutings } from './prisma/querries/outingsQuerries';
import { GetAllUsers } from './prisma/querries/usersQuerries';
import { Resolvers } from './generated/graphqlTypes';

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers: Resolvers = {
  Query: {
    basicUsers: (parent, args, context, info) => {
      console.log(context);
      const { user, decodedToken } = context;

      // const authUser = req
      if (!user || !decodedToken) {
        return null;
      }

      return GetAllUsers();
    },
    basicOutings: (parent, args, context, info) => {
      console.log(context);
      const { user, decodedToken } = context;
      if (!user || !decodedToken) {
        return null;
      }

      return GetAllOutings();
    },
  },
};

export default resolvers;
