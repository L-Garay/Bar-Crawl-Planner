import { GetAllOutings } from './prisma/querries/outingsQuerries';
import { GetAllUsers } from './prisma/querries/usersQuerries';
import { Resolvers } from './generated/graphqlTypes';
import { GraphQLError } from 'graphql';

const UNAUTHENTICATED = 'You are not authenticated, please log in to continue.';
const UNAUTHORIZED = 'You do not have permission to do this.';

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers: Resolvers = {
  Query: {
    basicUsers: (parent, args, context, info) => {
      console.log(context);
      const { user, decodedToken } = context;
      if (!user || !decodedToken) {
        throw new GraphQLError(UNAUTHENTICATED, {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return GetAllUsers();
    },
    basicOutings: (parent, args, context, info) => {
      console.log(context);
      const { user, decodedToken } = context;
      if (!user || !decodedToken) {
        throw new GraphQLError(UNAUTHENTICATED, {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return GetAllOutings();
    },
  },
};

export default resolvers;
