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

export async function GetAllFriendships(id: number): Promise<PrismaData> {
  try {
    const friends = await prismaClient.friendship.findMany({
      where: {
        OR: [
          {
            requestor_profile_id: id,
          },
          {
            addressee_profile_id: id,
          },
        ],
        AND: [
          {
            frienshipStatus_friendship_relation: {
              some: {
                status_code: 'A', // accepted
              },
            },
          },
        ],
      },
    });
    return { status: 'Success', data: friends, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
