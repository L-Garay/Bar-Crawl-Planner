import { Profile } from '@prisma/client';
import prismaClient from '../../index';
import { PrismaError, PrismaData } from '../../types/sharedTypes';

export async function GetProfileByAccountId(id: number): Promise<PrismaData> {
  try {
    const profile = await prismaClient.profile.findUnique({
      where: {
        account_Id: id,
      },
    });
    return { status: 'Success', data: profile, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
export async function GetProfileByProfileId(id: number): Promise<PrismaData> {
  try {
    const profile = await prismaClient.profile.findUnique({
      where: {
        id: id,
      },
    });
    return { status: 'Success', data: profile, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAllProfiles(): Promise<PrismaData> {
  try {
    const profiles = await prismaClient.profile.findMany();
    return { status: 'Success', data: profiles, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAcceptedProfilesInOuting(
  id: number
): Promise<PrismaData> {
  try {
    const profiles = await prismaClient.profile.findMany({
      where: {
        accepted_outings: {
          some: {
            id,
          },
        },
      },
    });
    return { status: 'Success', data: profiles, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
export async function GetPendingProfilesInOuting(
  id: number
): Promise<PrismaData> {
  try {
    const profiles = await prismaClient.profile.findMany({
      where: {
        pending_outings: {
          some: {
            id,
          },
        },
      },
    });
    return { status: 'Success', data: profiles, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
export async function GetDeclinedProfilesInOuting(
  id: number
): Promise<PrismaData> {
  try {
    const profiles = await prismaClient.profile.findMany({
      where: {
        declined_outings: {
          some: {
            id,
          },
        },
      },
    });
    return { status: 'Success', data: profiles, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetBlockedProfiles(
  profile: Profile
): Promise<PrismaData> {
  try {
    const blockedProfiles = await Promise.allSettled(
      profile.blocked_profile_ids.map(async (id) => {
        return await prismaClient.profile.findUnique({
          where: {
            id,
          },
        });
      })
    );

    const noNulls = blockedProfiles
      .map((promise) => {
        if (promise.status === 'fulfilled') {
          return promise.value;
        } else {
          console.log(promise.reason);
          return null;
        }
      })
      .filter((value) => value !== null);

    return { status: 'Success', data: noNulls, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
