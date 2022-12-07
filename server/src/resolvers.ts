import { GetAllOutings } from './prisma/querries/outingsQuerries';
import { GetAllProfiles } from './prisma/querries/profileQuerries';
import { Resolvers } from './types/generated/graphqlTypes';
import { GraphQLError } from 'graphql';
import { GetAllAccounts } from './prisma/querries/accountQuerries';

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers: Resolvers = {
  Query: {
    accounts: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const data = await GetAllAccounts();
      if (data.status === 'Failure') {
        // TODO how to handle Prisma failure in this resolver
        throw new GraphQLError('Temp error message for accounts', {
          extensions: { code: 'DB ERROR' },
        });
      } else {
        return data.data;
      }
    },
    profiles: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const data = await GetAllProfiles();
      if (data.status === 'Failure') {
        // TODO how to handle Prisma failure in this resolver
        throw new GraphQLError('Temp error message for profiles', {
          extensions: { code: 'DB ERROR' },
        });
      } else {
        return data.data;
      }
    },
    outings: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const data = await GetAllOutings();
      if (data.status === 'Failure') {
        // TODO how to handle Prisma failure in this resolver
        throw new GraphQLError('Temp error message for outings', {
          extensions: { code: 'DB ERROR' },
        });
      } else {
        return data.data;
      }
    },
  },
};

export default resolvers;
