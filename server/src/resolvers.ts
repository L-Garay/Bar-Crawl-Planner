import { GetAllOutings } from './prisma/querries/outingsQuerries';
import { GetAllUsers } from './prisma/querries/usersQuerries';
import { Resolvers } from './generated/graphqlTypes';
import { GraphQLError } from 'graphql';

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers: Resolvers = {
  Query: {
    basicUsers: (parent, args, context, info) => {
      console.log(context);
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      return GetAllUsers();
    },
    basicOutings: (parent, args, context, info) => {
      console.log(context);
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      return GetAllOutings();
    },
  },
};

export default resolvers;
