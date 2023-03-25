import {
  GetAllOutings,
  GetOutingByOutingId,
} from './prisma/querries/outingsQuerries';
import {
  GetAllProfiles,
  GetAcceptedProfilesInOuting,
  GetPendingProfilesInOuting,
  GetDeclinedProfilesInOuting,
} from './prisma/querries/profileQuerries';
import { Resolvers } from './types/generated/graphqlTypes';
import { GraphQLError } from 'graphql';
import {
  GetAccountByAccountId,
  GetAccountByEmail,
  GetAccountWithProfileData,
  GetAllAccounts,
} from './prisma/querries/accountQuerries';
import {
  CreateAccount,
  DeactivateUserAccount,
  UpdateAccountBySocialPin,
  UpdateUserAccount,
} from './prisma/mutations/accountMutations';
import { CreateProfile } from './prisma/mutations/profileMutations';
import { SearchCity } from './prisma/querries/mapQuerries';
import { CitySelectOptions, OutingInput } from './types/sharedTypes';
import {
  ConnectUserWithOuting,
  CreateOuting,
  DeleteOuting,
  DisconnectUserWithOuting,
  SendOutingInvites,
  SendOutingJoinedNotification,
  UpdateOuting,
} from './prisma/mutations/outingMutations';
import { Account, Profile } from '@prisma/client';
import { AddFriend } from './prisma/mutations/friendsMutations';
import {
  GetAllFriendships,
  GetFriendshipStatus,
} from './prisma/querries/friendsQuerries';
import {
  AcceptFriendRequest,
  DeclineFriendRequest,
  GenerateFriendRequestWithMachine,
  GenerateOutingNotificationWithMachine,
  OpenNotification,
} from './prisma/mutations/notificationMutations';
import {
  GetAllNotifications,
  GetFriendRequests,
  GetNewNotificationCount,
  GetSentFriendRequests,
} from './prisma/querries/notificationQuerries';

const resolvers: Resolvers = {
  Query: {
    accounts: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const accounts = await GetAllAccounts();
      if (accounts.status === 'Failure') {
        throw new GraphQLError('Cannot get all accounts', {
          extensions: {
            code: accounts.error?.name,
            message: accounts.error?.message,
            prismaMeta: accounts.error?.meta,
            prismaErrorCode: accounts.error?.errorCode,
          },
        });
      } else {
        return accounts.data;
      }
    },
    getAccountByEmail: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const account = await GetAccountByEmail(args.email);
      if (account.status === 'Failure') {
        throw new GraphQLError('Cannot get account', {
          extensions: {
            code: account.error?.name,
            message: account.error?.message,
            prismaMeta: account.error?.meta,
            prismaErrorCode: account.error?.errorCode,
          },
        });
      } else {
        return account.data;
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
    getAccountWithProfileData: async (parent, args, context, info) => {
      const { authError, user } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const account = await GetAccountWithProfileData(args.email);
      if (account.status === 'Failure') {
        throw new GraphQLError('Cannot get account', {
          extensions: {
            code: account.error?.name,
            message: account.error?.message,
            prismaMeta: account.error?.meta,
            prismaErrorCode: account.error?.errorCode,
          },
        });
      } else {
        return account.data;
      }
    },
    profiles: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const profiles = await GetAllProfiles();
      if (profiles.status === 'Failure') {
        throw new GraphQLError('Cannot get all profiles', {
          extensions: {
            code: profiles.error?.name,
            message: profiles.error?.message,
            prismaMeta: profiles.error?.meta,
            prismaErrorCode: profiles.error?.errorCode,
          },
        });
      } else {
        return profiles.data;
      }
    },
    getProfilesInOuting: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const accepted = await GetAcceptedProfilesInOuting(args.id);
      if (accepted.status === 'Failure') {
        throw new GraphQLError('Cannot get accepted for outing', {
          extensions: {
            code: accepted.error?.name,
            message: accepted.error?.message,
            prismaMeta: accepted.error?.meta,
            prismaErrorCode: accepted.error?.errorCode,
          },
        });
      }

      const pending = await GetPendingProfilesInOuting(args.id);
      if (pending.status === 'Failure') {
        throw new GraphQLError('Cannot get pending for outing', {
          extensions: {
            code: pending.error?.name,
            message: pending.error?.message,
            prismaMeta: pending.error?.meta,
            prismaErrorCode: pending.error?.errorCode,
          },
        });
      }

      const declined = await GetDeclinedProfilesInOuting(args.id);
      if (declined.status === 'Failure') {
        throw new GraphQLError('Cannot get declined for outing', {
          extensions: {
            code: declined.error?.name,
            message: declined.error?.message,
            prismaMeta: declined.error?.meta,
            prismaErrorCode: declined.error?.errorCode,
          },
        });
      }
      return {
        accepted_profiles: accepted.data,
        pending_profiles: pending.data,
        declined_profiles: declined.data,
      };
    },
    getAllOutings: async (parent, args, context, info) => {
      const { authError, profile } = context;

      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const outings = await GetAllOutings(profile.data.id);
      if (outings.status === 'Failure') {
        throw new GraphQLError('Cannot get all outings', {
          extensions: {
            code: outings.error?.name,
            message: outings.error?.message,
            prismaMeta: outings.error?.meta,
            prismaErrorCode: outings.error?.errorCode,
          },
        });
      } else {
        return outings.data;
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
            prismaMeta: outing.error?.meta,
            prismaErrorCode: outing.error?.errorCode,
          },
        });
      } else {
        return outing.data;
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
      const locations = await SearchCity(city, args.locationType);
      if (locations.status === 'Failure') {
        throw new GraphQLError('Cannot search city', {
          extensions: {
            code: locations.error?.name,
            message: locations.error?.message,
            prismaMeta: locations.error?.meta,
            prismaErrorCode: locations.error?.errorCode,
          },
        });
      } else {
        return locations.data;
      }
    },
    getAllFriendships: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { id } = profile.data;
      const friends = await GetAllFriendships(id);
      if (friends.status === 'Failure') {
        throw new GraphQLError('Cannot get all friends', {
          extensions: {
            code: friends.error?.name,
            message: friends.error?.message,
            prismaMeta: friends.error?.meta,
            prismaErrorCode: friends.error?.errorCode,
          },
        });
      } else {
        console.log(friends.data);

        return friends.data;
      }
    },
    getAllNotifications: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { id } = profile.data;
      const notifications = await GetAllNotifications(id);
      if (notifications.status === 'Failure') {
        throw new GraphQLError('Cannot get all notifications', {
          extensions: {
            code: notifications.error?.name,
            message: notifications.error?.message,
            prismaMeta: notifications.error?.meta,
            prismaErrorCode: notifications.error?.errorCode,
          },
        });
      } else {
        return notifications.data;
      }
    },
    getNewNotificationCount: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { id } = profile.data;
      const count = await GetNewNotificationCount(id);
      if (count.status === 'Failure') {
        throw new GraphQLError('Cannot get new notification count', {
          extensions: {
            code: count.error?.name,
            message: count.error?.message,
            prismaMeta: count.error?.meta,
            prismaErrorCode: count.error?.errorCode,
          },
        });
      } else {
        return count.data;
      }
    },
    getSentFriendRequests: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { id } = profile.data;
      const requests = await GetSentFriendRequests(id);
      if (requests.status === 'Failure') {
        throw new GraphQLError('Cannot get sent friend requests', {
          extensions: {
            code: requests.error?.name,
            message: requests.error?.message,
            prismaMeta: requests.error?.meta,
            prismaErrorCode: requests.error?.errorCode,
          },
        });
      } else {
        return requests.data;
      }
    },
    getFriendRequests: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { id } = profile.data;
      const requests = await GetFriendRequests(id);
      if (requests.status === 'Failure') {
        throw new GraphQLError('Cannot get friend requests', {
          extensions: {
            code: requests.error?.name,
            message: requests.error?.message,
            prismaMeta: requests.error?.meta,
            prismaErrorCode: requests.error?.errorCode,
          },
        });
      } else {
        return requests.data;
      }
    },
    getFriendshipStatus: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { id: user_id } = profile.data;
      const { target_id } = args;
      const status = await GetFriendshipStatus(user_id, target_id);
      if (status.status === 'Failure') {
        throw new GraphQLError('Cannot get friendship status', {
          extensions: {
            code: status.error?.name,
            message: status.error?.message,
            prismaMeta: status.error?.meta,
            prismaErrorCode: status.error?.errorCode,
          },
        });
      } else {
        return status.data;
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
      const { phone_number } = args;
      const updatedUser = await UpdateUserAccount(
        originalUserEmail,
        phone_number
      );
      if (updatedUser.status === 'Failure') {
        throw new GraphQLError('Cannot update user account', {
          extensions: {
            code: updatedUser.error?.name,
            message: updatedUser.error?.message,
            prismaMeta: updatedUser.error?.meta,
            prismaErrorCode: updatedUser.error?.errorCode,
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
            prismaMeta: deactivatedUser.error?.meta,
            prismaErrorCode: deactivatedUser.error?.errorCode,
          },
        });
      } else {
        return deactivatedUser.data;
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
      const outingData = { ...outingInput, creator_profile_id: userId };
      const outing = await CreateOuting(outingData);
      if (outing.status === 'Failure') {
        throw new GraphQLError('Cannot create outing', {
          extensions: {
            code: outing.error?.name,
            message: outing.error?.message,
            prismaMeta: outing.error?.meta,
            prismaErrorCode: outing.error?.errorCode,
          },
        });
      } else {
        return outing.data;
      }
    },
    updateOuting: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { id, name, start_date_and_time } = args;
      const validName = name ? name : undefined;
      const validDate = start_date_and_time ? start_date_and_time : undefined;

      const outing = await UpdateOuting(id, validName, validDate);
      if (outing.status === 'Failure') {
        throw new GraphQLError('Cannot update outing', {
          extensions: {
            code: outing.error?.name,
            message: outing.error?.message,
            prismaMeta: outing.error?.meta,
            prismaErrorCode: outing.error?.errorCode,
          },
        });
      } else {
        return outing.data;
      }
    },
    deleteOuting: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const outing = await DeleteOuting(args.id);
      if (outing.status === 'Failure') {
        throw new GraphQLError('Cannot delete outing', {
          extensions: {
            code: outing.error?.name,
            message: outing.error?.message,
            prismaMeta: outing.error?.meta,
            prismaErrorCode: outing.error?.errorCode,
          },
        });
      } else {
        return outing.data;
      }
    },
    sendOutingInvites: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { outing_id, start_date_and_time, emails } = args;

      // iterate through emails and remove those who are already accepted
      // get the accepted profiles
      const acceptedProfiles = await GetAcceptedProfilesInOuting(outing_id);
      // get the accepted accounts from the accepted profiles
      const acceptedAccounts = acceptedProfiles.data.map(
        async (profile: Profile) => {
          return await GetAccountByAccountId(profile.account_Id);
        }
      );
      const resolvedAcceptedAccounts = await Promise.all(acceptedAccounts);
      // filter out the emails that are already accepted
      const emailsToSend = emails.filter((email: string) => {
        if (
          resolvedAcceptedAccounts.find(
            (account: any) => account.data.email === email
          )
        ) {
          return false;
        } else {
          return true;
        }
      });

      const inviteArgs = {
        outing_id,
        start_date_and_time,
        emails: emailsToSend,
        senderName: profile.data.name,
      };

      const status = await SendOutingInvites(inviteArgs);

      if (status.status === 'Failure') {
        throw new GraphQLError('Cannot send outing invites', {
          extensions: {
            code: status.error?.name,
            message: status.error?.message,
            prismaMeta: status.error?.meta,
            prismaErrorCode: status.error?.errorCode,
          },
        });
      } else {
        return status.data;
      }
    },
    ConnectUserWithOuting: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { outing_id, profile_id } = args;

      const connectedUser = await ConnectUserWithOuting(outing_id, profile_id);
      if (connectedUser.status === 'Failure') {
        throw new GraphQLError('Cannot connect user with outing', {
          extensions: {
            code: connectedUser.error?.name,
            message: connectedUser.error?.message,
            prismaMeta: connectedUser.error?.meta,
            prismaErrorCode: connectedUser.error?.errorCode,
          },
        });
      } else {
        return connectedUser.data;
      }
    },
    DisconnectUserWithOuting: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { outing_id, profile_id } = args;
      const disconnectedUser = await DisconnectUserWithOuting(
        outing_id,
        profile_id
      );
      if (disconnectedUser.status === 'Failure') {
        throw new GraphQLError('Cannot disconnect user from outing', {
          extensions: {
            code: disconnectedUser.error?.name,
            message: disconnectedUser.error?.message,
            prismaMeta: disconnectedUser.error?.meta,
            prismaErrorCode: disconnectedUser.error?.errorCode,
          },
        });
      } else {
        return disconnectedUser.data;
      }
    },
    UpdateAccountBySocialPin: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { profile_id, social_pin, email } = args;
      const updatedUser = await UpdateAccountBySocialPin(
        profile_id,
        social_pin,
        email
      );
      if (updatedUser.status === 'Failure') {
        throw new GraphQLError('Cannot update user account using social_pin', {
          extensions: {
            code: updatedUser.error?.name,
            message: updatedUser.error?.message,
            prismaMeta: updatedUser.error?.meta,
            prismaErrorCode: updatedUser.error?.errorCode,
          },
        });
      } else {
        return updatedUser.data;
      }
    },
    CreateAccountAndProfile: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { name, picture, email, verified } = args;

      const account = await CreateAccount(email, verified);
      if (account.status === 'Failure') {
        throw new GraphQLError('Cannot create user account', {
          extensions: {
            code: account.error?.name,
            message: account.error?.message,
            prismaMeta: account.error?.meta,
            prismaErrorCode: account.error?.errorCode,
          },
        });
      }

      const profile = await CreateProfile(name, picture, account.data.id);
      if (profile.status === 'Failure') {
        throw new GraphQLError('Cannot create user profile', {
          extensions: {
            code: profile.error?.name,
            message: profile.error?.message,
            prismaMeta: profile.error?.meta,
            prismaErrorCode: profile.error?.errorCode,
          },
        });
      }

      return `Account ${account.data.id} and Profile ${profile.data.id} created`;
    },
    generateFriendRequest: async (parent, args, context, info) => {
      const { authError, profile: sender_profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { addressee_profile_id } = args;

      const notificationResponse = await GenerateFriendRequestWithMachine(
        addressee_profile_id, // recipient_profile_id
        sender_profile.data.id // sender_profile_id
      );
      if (notificationResponse.status === 'Failure') {
        throw new GraphQLError('Cannot generate friend request', {
          extensions: {
            code: notificationResponse.error?.name,
            message: notificationResponse.error?.message,
            prismaMeta: notificationResponse.error?.meta,
            prismaErrorCode: notificationResponse.error?.errorCode,
          },
        });
      } else {
        return notificationResponse.data;
      }
    },
    generateOutingNotification: async (parent, args, context, info) => {
      const { authError, profile: sender_profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { outing_id } = args;

      const status = await SendOutingJoinedNotification(
        outing_id,
        sender_profile
      );

      if (status.status === 'Failure') {
        throw new GraphQLError('Cannot generate outing joined notifications', {
          extensions: {
            code: status.error?.name,
            message: status.error?.message,
            prismaMeta: status.error?.meta,
            prismaErrorCode: status.error?.errorCode,
          },
        });
      }

      return status.data;
    },
    openNotification: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { notification_created_at, id, type_code } = args;
      const { id: modifier_profile_id } = profile.data;

      const notificationResponse = await OpenNotification(
        modifier_profile_id,
        type_code,
        notification_created_at,
        id
      );

      if (notificationResponse.status === 'Failure') {
        throw new GraphQLError('Cannot open notification', {
          extensions: {
            code: notificationResponse.error?.name,
            message: notificationResponse.error?.message,
            prismaMeta: notificationResponse.error?.meta,
            prismaErrorCode: notificationResponse.error?.errorCode,
          },
        });
      } else {
        return notificationResponse.data;
      }
    },
    acceptFriendRequest: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const {
        notification_created_at,
        notification_id,
        sender_profile_id,
        addressee_profile_id,
      } = args;

      const { id: modifier_profile_id } = profile.data;

      const notificationResponse = await AcceptFriendRequest(
        sender_profile_id,
        addressee_profile_id,
        notification_created_at,
        notification_id,
        modifier_profile_id
      );

      if (notificationResponse.status === 'Failure') {
        throw new GraphQLError('Cannot accept friend request', {
          extensions: {
            code: notificationResponse.error?.name,
            message: notificationResponse.error?.message,
            prismaMeta: notificationResponse.error?.meta,
            prismaErrorCode: notificationResponse.error?.errorCode,
          },
        });
      } else {
        return notificationResponse.data;
      }
    },
    declineFriendRequest: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { notification_created_at, notification_id } = args;
      const { id: modifier_profile_id } = profile.data;

      const notificationResponse = await DeclineFriendRequest(
        modifier_profile_id,
        notification_id,
        notification_created_at
      );

      if (notificationResponse.status === 'Failure') {
        throw new GraphQLError('Cannot decline friend request', {
          extensions: {
            code: notificationResponse.error?.name,
            message: notificationResponse.error?.message,
            prismaMeta: notificationResponse.error?.meta,
            prismaErrorCode: notificationResponse.error?.errorCode,
          },
        });
      } else {
        return notificationResponse.data;
      }
    },
  },
};

export default resolvers;
