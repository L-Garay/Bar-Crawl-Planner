import prismaClient from '../..';
import {
  GenerateOutingInviteEmailWithProfilesInput,
  GenerateOutingInviteEmailsWithAccountsInput,
  OutingInput,
  OutingInviteProfiles,
  PrismaError,
  PrismaData,
  SendingOutingInvitesAndCreateInput,
  Email,
  SendingOutingInvitesInput,
} from '../../types/sharedTypes';

import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import { Account, Profile } from '@prisma/client';
import dotenv from 'dotenv';
import { GetOutingByOutingId } from '../querries/outingsQuerries';
import { GetAccountByAccountId } from '../querries/accountQuerries';
import { GetAcceptedProfilesInOuting } from '../querries/profileQuerries';
import {
  GenerateOutingJoinedEmail,
  GenerateOutingInviteEmailWithAccounts,
  GenerateOutingInviteEmailWithProfiles,
} from '../../utilities/generateEmails';
import { nanoid } from 'nanoid';
import GetEmailTools from '../../utilities/generateEmails/getEmailTools';

dotenv.config();

export async function CreateOuting({
  name,
  created_at,
  start_date_and_time,
  place_ids,
  creator_profile_id,
}: OutingInput): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.create({
      data: {
        name,
        creator_profile_id: creator_profile_id,
        created_at,
        start_date_and_time,
        place_ids,
        accepted_profiles: {
          connect: { id: creator_profile_id },
        },
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function UpdateOuting(
  outingId: number,
  name?: string,
  start_date_and_time?: string
): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.update({
      where: {
        id: outingId,
      },
      data: {
        name,
        start_date_and_time,
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function DeleteOuting(outingId: number) {
  try {
    await prismaClient.outing.delete({
      where: {
        id: outingId,
      },
    });
    return {
      status: 'Success',
      data: 'Successfully deleted outing',
      error: null,
    };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function AddPendingUserToOuting(
  outingId: number,
  profileId: number
): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.update({
      where: { id: outingId },
      data: {
        pending_profiles: {
          connect: { id: profileId },
        },
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    return {
      status: 'Failure',
      data: { outingId, profileId },
      error: error as PrismaError,
    };
  }
}

export async function ConnectUserWithOuting(
  outingId: number,
  profileId: number
): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.update({
      where: { id: outingId },
      data: {
        pending_profiles: {
          disconnect: { id: profileId },
        },
        accepted_profiles: {
          connect: {
            id: profileId,
          },
        },
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    console.log(error);
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function DisconnectUserWithOuting(
  profileId: number,
  outingId: number
): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.update({
      where: { id: outingId },
      data: {
        accepted_profiles: {
          disconnect: { id: profileId },
        },
        pending_profiles: {
          disconnect: { id: profileId },
        },
      },
      include: {
        accepted_profiles: true,
        pending_profiles: true,
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    console.log(error);
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
