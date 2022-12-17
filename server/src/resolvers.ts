import { GetAllOutings } from './prisma/querries/outingsQuerries';
import { GetAllProfiles } from './prisma/querries/profileQuerries';
import { Resolvers } from './types/generated/graphqlTypes';
import { GraphQLError } from 'graphql';
import {
  GetAccountByEmail,
  GetAllAccounts,
} from './prisma/querries/accountQuerries';
import { UpdateUserAccount } from './prisma/mutations/accountMutations';

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
        throw new GraphQLError('Cannot get all accounts', {
          extensions: { code: data.error?.name, message: data.error?.message },
        });
      } else {
        return data.data;
      }
    },
    // NOTE since the account is already set in context each request, when a user requests to get their account we can just return the user set in the context
    // so that means this resolver will likely only be used by admins in the future, as a way to edit/suspend/delete other user's accounts
    // which means it will likely need extra auth/role checks
    getAccountByEmail: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const data = await GetAccountByEmail(args.email);
      if (data.status === 'Failure') {
        throw new GraphQLError('Cannot get account', {
          extensions: { code: data.error?.name, message: data.error?.message },
        });
      } else {
        return data.data;
      }
    },
    getUserAccount: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      return user.data;
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
        throw new GraphQLError('Cannot get all profiles', {
          extensions: { code: data.error?.name, message: data.error?.message },
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
        throw new GraphQLError('Cannot get all outings', {
          extensions: { code: data.error?.name, message: data.error?.message },
        });
      } else {
        return data.data;
      }
    },
  },
  Mutation: {
    updateUserAccount: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const originalUserEmail = user.data.email;
      const { phone_number, email } = args;
      const updatedUser = await UpdateUserAccount(
        originalUserEmail,
        phone_number,
        email
      );
      if (updatedUser.status === 'Failure') {
        throw new GraphQLError('Cannot update user account', {
          extensions: {
            code: updatedUser.error?.name,
            message: updatedUser.error?.message,
          },
        });
      } else {
        return updatedUser.data;
      }
    },
  },
};

export default resolvers;
