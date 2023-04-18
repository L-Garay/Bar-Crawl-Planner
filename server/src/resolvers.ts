import {
  GetAllOutings,
  GetCreatedOutings,
  GetJoinedOutings,
  GetOutingByOutingId,
  GetPendingOutings,
  GetPendingOutingsCount,
} from './prisma/querries/outingsQuerries';
import {
  GetAllProfiles,
  GetAcceptedProfilesInOuting,
  GetPendingProfilesInOuting,
  GetDeclinedProfilesInOuting,
  GetBlockedProfiles,
  GetProfileBySocialPin,
  GetProfileByProfileId,
} from './prisma/querries/profileQuerries';
import { Resolvers } from './types/generated/graphqlTypes';
import { GraphQLError } from 'graphql';
import {
  GetAccountByAccountId,
  GetAccountByEmail,
  GetAccountWithProfileData,
  GetAllAccounts,
  GetBlockedAccountEmails,
} from './prisma/querries/accountQuerries';
import {
  CreateAccount,
  DeactivateUserAccount,
  UpdateAccountBySocialPin,
  UpdateUserAccount,
} from './prisma/mutations/accountMutations';
import {
  BlockProfile,
  CreateProfile,
  UnblockProfile,
} from './prisma/mutations/profileMutations';
import { SearchCity } from './prisma/querries/mapQuerries';
import {
  Account,
  CitySelectOptions,
  OutingInput,
  PrismaData,
} from './types/sharedTypes';
import {
  ConnectUserWithOuting,
  CreateOuting,
  DeleteOuting,
  DisconnectUserWithOuting,
  SendOutingInvites,
  SendOutingInvitesAndCreate,
  SendOutingJoinedEmail,
  UpdateOuting,
} from './prisma/mutations/outingMutations';
import { Profile } from '@prisma/client';
import {
  UpdateFriend,
  SendFriendRequestEmail,
  AddFriend,
  ReAddFriend,
} from './prisma/mutations/friendsMutations';
import {
  CheckDeclinedOrRemoved,
  CheckFriendsOrRequested,
  GetAllFriendships,
  GetFriendship,
  GetRecievedFriendRequestCount,
  GetRecievedFriendRequests,
  GetSentFriendRequests,
} from './prisma/querries/friendsQuerries';

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
    getProfile: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      return profile.data;
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
    getCreatedOutings: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const outings = await GetCreatedOutings(profile.data.id);
      if (outings.status === 'Failure') {
        throw new GraphQLError('Cannot get created outings', {
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
    getJoinedOutings: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const outings = await GetJoinedOutings(profile.data.id);
      if (outings.status === 'Failure') {
        throw new GraphQLError('Cannot get joined outings', {
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
    getPendingOutings: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { id } = profile.data;
      const outings = await GetPendingOutings(id);

      if (outings.status === 'Failure') {
        throw new GraphQLError('Cannot get pending outings', {
          extensions: {
            code: outings.error?.name,
            message: outings.error?.message,
            prismaMeta: outings.error?.meta,
            prismaErrorCode: outings.error?.errorCode,
          },
        });
      }

      const creatorProfilePromisesArray = await Promise.allSettled(
        outings.data.map(async (outing: any) => {
          return await GetProfileByProfileId(outing.creator_profile_id);
        })
      );

      const creatorProfiles = creatorProfilePromisesArray
        .map((promise) => {
          if (
            promise.status === 'fulfilled' &&
            promise.value.status === 'Success'
          ) {
            return promise.value.data;
          } else if (promise.status === 'rejected') {
            // log to some service
            console.log(
              'Error getting creator profile for pending outing: ',
              promise.reason
            );
            // even though we are return null here
            // logging the creatorProfiles array below will show that 'undefined' is actually inserted into the array
            return null;
          }
        })
        .filter((profile) => profile !== undefined);

      return {
        pending_outings: outings.data,
        outing_creator_profiles: creatorProfiles,
      };
    },
    getPendingOutingsCount: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { id } = profile.data;
      const count = await GetPendingOutingsCount(id);

      if (count.status === 'Failure') {
        throw new GraphQLError('Cannot get pending count count', {
          extensions: {
            code: count.error?.name,
            message: count.error?.message,
            prismaMeta: count.error?.meta,
            prismaErrorCode: count.error?.errorCode,
          },
        });
      }

      return count.data;
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
        return friends.data;
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
    getRecievedFriendRequests: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { id } = profile.data;
      const requests = await GetRecievedFriendRequests(id);

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
    getRecievedFriendRequestCount: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const { id } = profile.data;
      const requests = await GetRecievedFriendRequestCount(id);

      if (requests.status === 'Failure') {
        throw new GraphQLError('Cannot get friend request count', {
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
    getBlockedProfiles: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }

      const blockedProfiles = await GetBlockedProfiles(profile.data);

      if (blockedProfiles.status === 'Failure') {
        throw new GraphQLError('Cannot get blocked profiles', {
          extensions: {
            code: blockedProfiles.error?.name,
            message: blockedProfiles.error?.message,
            prismaMeta: blockedProfiles.error?.meta,
            prismaErrorCode: blockedProfiles.error?.errorCode,
          },
        });
      } else {
        return blockedProfiles.data;
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
      const { outing_id, start_date_and_time, account_Ids, outing_name } = args;

      // I don't believe we need to check for blocked emails, since these will be coming from the user's friends list
      // We can have a client side check to make sure the user isn't inviting someone who is already invited
      // OR should we check those things here anyway?

      // 1. get the emails of the accounts that are being invited
      const accounts = await Promise.allSettled(
        account_Ids.map(async (id: number) => {
          return await GetAccountByAccountId(id);
        })
      );
      let noNullAccounts: Account[] = [];
      accounts.forEach((promise) => {
        if (promise.status === 'rejected') {
          console.log(promise.reason);
        }
        if (promise.status === 'fulfilled') {
          if (promise.value.data !== null) {
            noNullAccounts.push(promise.value.data);
          }
        }
      });
      // 2. send emails
      const inviteArgs = {
        outing_id,
        outing_name,
        start_date_and_time,
        accounts: noNullAccounts,
        senderName: profile.data.name,
      };
      const emailStatus = await SendOutingInvites(inviteArgs);

      if (emailStatus.status === 'Failure') {
        throw new GraphQLError('Cannot get friends', {
          extensions: {
            code: emailStatus.error?.name,
            message: emailStatus.error?.message,
            prismaMeta: emailStatus.error?.meta,
            prismaErrorCode: emailStatus.error?.errorCode,
          },
        });
      } else {
        return emailStatus.data;
      }
    },
    sendOutingInvitesAndCreate: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { outing_id, start_date_and_time, emails } = args;

      // check to make sure user isn't trying to invite someone who has blocked them or they have blocked
      const blockedEmails = await GetBlockedAccountEmails(emails, profile.data);
      if (blockedEmails.status === 'Failure') {
        // should we allow this to continue if this fails?
        console.log(blockedEmails.error);
      }

      // iterate through emails and remove those who are already accepted
      // get the accepted profiles
      const acceptedProfiles = await GetAcceptedProfilesInOuting(outing_id);
      // get the accepted accounts from the accepted profiles
      const resolvedAcceptedAccounts = await Promise.all(
        acceptedProfiles.data.map(async (profile: Profile) => {
          return await GetAccountByAccountId(profile.account_Id);
        })
      );

      // if one of the emails provided is associated with an account that is already attending the outing, return false
      const nonAcceptedEmails = emails.filter((email: string) => {
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

      // the nonAcceptedEmails will have all emails that are not already accepted, it doesn't filter out blocked emails
      // so we need to do so here
      const emailsToSend = nonAcceptedEmails.filter((email) => {
        if (blockedEmails.data.includes(email)) {
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

      const status = await SendOutingInvitesAndCreate(inviteArgs);

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
      const outing = await DisconnectUserWithOuting(profile_id, outing_id);
      if (outing.status === 'Failure') {
        throw new GraphQLError('Cannot disconnect user from outing', {
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
    UpdateAccountBySocialPin: async (parent, args, context, info) => {
      const { authError } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { profile_id, social_pin, email } = args;

      const profile = await GetProfileByProfileId(profile_id);
      if (profile.status === 'Failure') {
        throw new GraphQLError('Cannot get profile', {
          extensions: {
            code: profile.error?.name,
            message: profile.error?.message,
            prismaMeta: profile.error?.meta,
            prismaErrorCode: profile.error?.errorCode,
          },
        });
      }
      const account = await GetAccountByAccountId(profile.data.account_Id);
      if (account.status === 'Failure') {
        throw new GraphQLError('Cannot get account', {
          extensions: {
            code: account.error?.name,
            message: account.error?.message,
            prismaMeta: account.error?.meta,
            prismaErrorCode: account.error?.errorCode,
          },
        });
      }

      const updatedUser = await UpdateAccountBySocialPin(
        account.data.id,
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

      // TODO make this a transaction, so if the profile creation fails, the account is rolled back
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
    sendFriendRequestEmail: async (parent, args, context, info) => {
      const { authError, profile: sender_profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { addressee_profile_id } = args;

      const friendOrRequested = await CheckFriendsOrRequested(
        addressee_profile_id,
        sender_profile.data.id
      );
      if (friendOrRequested.data == 1) {
        throw new GraphQLError('Already friends');
      }

      // check for Removed or Declined
      // if there is data, then we know that a record was found in the DB and data should not be null
      const hasExistingFriendshipRecord = await CheckDeclinedOrRemoved(
        addressee_profile_id,
        sender_profile.data.id
      );

      if (hasExistingFriendshipRecord.data != null) {
        const updatedFriend = await ReAddFriend(
          hasExistingFriendshipRecord.data.id,
          addressee_profile_id,
          sender_profile.data.id
        );
        if (updatedFriend.status === 'Failure') {
          throw new GraphQLError('Cannot update friend', {
            extensions: {
              code: updatedFriend.error?.name,
              message: updatedFriend.error?.message,
              prismaMeta: updatedFriend.error?.meta,
              prismaErrorCode: updatedFriend.error?.errorCode,
            },
          });
        }
      } else {
        const addedFriend = await AddFriend(
          sender_profile.data.id,
          addressee_profile_id
        );

        if (addedFriend.status === 'Failure') {
          throw new GraphQLError('Cannot add friend', {
            extensions: {
              code: addedFriend.error?.name,
              message: addedFriend.error?.message,
              prismaMeta: addedFriend.error?.meta,
              prismaErrorCode: addedFriend.error?.errorCode,
            },
          });
        }
      }

      const emailResponse = await SendFriendRequestEmail(
        addressee_profile_id,
        sender_profile.data.id
      );
      if (emailResponse.status === 'Failure') {
        console.log(emailResponse.error);
        console.log(`Error sending email ${emailResponse.error?.message}`);
      }

      return emailResponse.data ? emailResponse.data : 'Friendship created';
    },
    sendFriendRequestFromSocialPin: async (parent, args, context, info) => {
      const { authError, profile: sender_profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { social_pin } = args;

      const addressee_profile = await GetProfileBySocialPin(social_pin);

      if (addressee_profile.data === null) {
        throw new GraphQLError('Cannot find profile with that social pin', {
          extensions: {
            code: addressee_profile.error?.name,
            message: addressee_profile.error?.message,
            prismaMeta: addressee_profile.error?.meta,
            prismaErrorCode: addressee_profile.error?.errorCode,
          },
        });
      }

      // checks for Accepted, Sent and Blocked
      // if the status is 1 then we know they shouldn't be able to send a request
      const friendOrRequested = await CheckFriendsOrRequested(
        addressee_profile.data.id,
        sender_profile.data.id
      );
      if (friendOrRequested.data == 1) {
        throw new GraphQLError('Already friends or requested');
      }

      // check for Removed or Declined
      // if there is data, then we know that a record was found in the DB and data should not be null
      const hasExistingFriendshipRecord = await CheckDeclinedOrRemoved(
        addressee_profile.data.id,
        sender_profile.data.id
      );

      if (hasExistingFriendshipRecord.data != null) {
        console.log('should be updating friend');
        const updatedFriend = await ReAddFriend(
          hasExistingFriendshipRecord.data.id,
          addressee_profile.data.id,
          sender_profile.data.id
        );
        if (updatedFriend.status === 'Failure') {
          throw new GraphQLError('Cannot update friend', {
            extensions: {
              code: updatedFriend.error?.name,
              message: updatedFriend.error?.message,
              prismaMeta: updatedFriend.error?.meta,
              prismaErrorCode: updatedFriend.error?.errorCode,
            },
          });
        }
      } else {
        const addedFriend = await AddFriend(
          sender_profile.data.id,
          addressee_profile.data.id
        );

        if (addedFriend.status === 'Failure') {
          throw new GraphQLError('Cannot add friend', {
            extensions: {
              code: addedFriend.error?.name,
              message: addedFriend.error?.message,
              prismaMeta: addedFriend.error?.meta,
              prismaErrorCode: addedFriend.error?.errorCode,
            },
          });
        }
      }

      const emailResponse = await SendFriendRequestEmail(
        addressee_profile.data.id,
        sender_profile.data.id
      );
      if (emailResponse.status === 'Failure') {
        // we don't want to throw error here if we were able to create the friendship record but not send email
        // user will still be able to see/interact with the friend request in the app
        console.log(`Cannot send email: ${emailResponse.error?.message}`);
        console.log(emailResponse.error);
      }
      return emailResponse.data ? emailResponse.data : 'Friendship created';
    },
    updateFriend: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { friendship_id, status_code } = args;

      const status = await UpdateFriend(
        friendship_id,
        profile.data.id,
        status_code
      );
      if (status.status === 'Failure') {
        throw new GraphQLError('Cannot accept friend request', {
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
    blockProfile: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { blocked_profile_id, friend_id } = args;

      const status = await BlockProfile(
        profile.data.id,
        blocked_profile_id,
        friend_id
      );
      if (status.status === 'Failure') {
        throw new GraphQLError('Cannot block profile', {
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
    unblockProfile: async (parent, args, context, info) => {
      const { authError, profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { blocked_profile_id } = args;

      const friendship = await GetFriendship(
        profile.data.id,
        blocked_profile_id
      );
      if (friendship.status === 'Failure') {
        throw new GraphQLError('Cannot get friendship', {
          extensions: {
            code: friendship.error?.name,
            message: friendship.error?.message,
            prismaMeta: friendship.error?.meta,
            prismaErrorCode: friendship.error?.errorCode,
          },
        });
      }

      const status = await UnblockProfile(
        profile.data,
        blocked_profile_id,
        friendship.data.id
      );
      if (status.status === 'Failure') {
        throw new GraphQLError('Cannot unblock profile', {
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
    sendOutingJoinedEmail: async (parent, args, context, info) => {
      const { authError, profile: sender_profile } = context;
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: authError.code },
        });
      }
      const { outing_id } = args;

      const status = await SendOutingJoinedEmail(outing_id, sender_profile);

      if (status.status === 'Failure') {
        throw new GraphQLError('Cannot send outing joined emails', {
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
  },
};

export default resolvers;
