import {
  GetAllOutings,
  GetOutingByOutingId,
} from './prisma/querries/outingsQuerries';
import {
  FindFriendById,
  FindFriendByPin,
  GetAllFriends,
  GetAllProfiles,
} from './prisma/querries/profileQuerries';
import { Resolvers } from './types/generated/graphqlTypes';
import { GraphQLError } from 'graphql';
import {
  GetAccountByEmail,
  GetAllAccounts,
} from './prisma/querries/accountQuerries';
import {
  DeactivateUserAccount,
  UpdateUserAccount,
} from './prisma/mutations/accountMutations';
import { AddFriend, RemoveFriend } from './prisma/mutations/profileMutations';
import { SearchCity } from './prisma/querries/mapQuerries';
import { CitySelectOptions, OutingInput } from './types/sharedTypes';
import { CreateOuting } from './prisma/mutations/outingMutations';

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
    getAllOutings: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const data = await GetAllOutings(args.id);
      if (data.status === 'Failure') {
        throw new GraphQLError('Cannot get all outings', {
          extensions: { code: data.error?.name, message: data.error?.message },
        });
      } else {
        return data.data;
      }
    },
    getOuting: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const outing = await GetOutingByOutingId(args.id);
      if (outing.status === 'Failure') {
        throw new GraphQLError('Cannot get outing', {
          extensions: {
            code: outing.error?.name,
            message: outing.error?.message,
          },
        });
      } else {
        return outing.data;
      }
    },
    getAllFriends: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const data = await GetAllFriends(user.data.id);
      if (data.status === 'Failure') {
        throw new GraphQLError('Cannot get all friends', {
          extensions: { code: data.error?.name, message: data.error?.message },
        });
      } else {
        return data.data;
      }
    },
    findFriendById: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const data = await FindFriendById(args.id);
      if (data.status === 'Failure') {
        throw new GraphQLError('Cannot get friend by id', {
          extensions: { code: data.error?.name, message: data.error?.message },
        });
      } else {
        return data.data;
      }
    },
    findFriendByPin: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const data = await FindFriendByPin(args.social_pin);
      if (data.status === 'Failure') {
        throw new GraphQLError('Cannot get friend by pin', {
          extensions: { code: data.error?.name, message: data.error?.message },
        });
      } else {
        return data.data;
      }
    },
    searchCity: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const city = args.city as CitySelectOptions;
      const data = await SearchCity(city, args.locationType);
      if (data.status === 'Failure') {
        throw new GraphQLError('Cannot search city', {
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
    deactivateUserAccount: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { id } = args;
      const deactivatedUser = await DeactivateUserAccount(id);

      if (deactivatedUser.status === 'Failure') {
        throw new GraphQLError('Cannot delete user account', {
          extensions: {
            code: deactivatedUser.error?.name,
            message: deactivatedUser.error?.message,
          },
        });
      } else {
        return deactivatedUser.data;
      }
    },
    addFriend: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { id, friend_id } = args;
      const addedFriend = await AddFriend(id, friend_id);
      if (addedFriend.status === 'Failure') {
        throw new GraphQLError('Cannot add friend', {
          extensions: {
            code: addedFriend.error?.name,
            message: addedFriend.error?.message,
          },
        });
      } else {
        return addedFriend.data;
      }
    },
    removeFriend: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { id, friend_id } = args;
      const removedFriend = await RemoveFriend(id, friend_id);
      if (removedFriend.status === 'Failure') {
        throw new GraphQLError('Cannot remove friend', {
          extensions: {
            code: removedFriend.error?.name,
            message: removedFriend.error?.message,
          },
        });
      } else {
        return removedFriend.data;
      }
    },
    createOuting: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const outingInput = { ...args } as OutingInput;
      const userId = user.data.id;
      const outingData = { ...outingInput, creatorId: userId };
      const outing = await CreateOuting(outingData);
      if (outing.status === 'Failure') {
        throw new GraphQLError('Cannot create outing', {
          extensions: {
            code: outing.error?.name,
            message: outing.error?.message,
          },
        });
      } else {
        return outing.data;
      }
    },
  },
};

export default resolvers;
