import prismaClient from '../../index';
import { PrismaError, QueryData } from '../../types/sharedTypes';
import { GetServerError } from '../../utilities/';

export async function GetProfileByAccountId(id: number): Promise<QueryData> {
  try {
    const profile = await prismaClient.profile.findUnique({
      where: {
        account_Id: id,
      },
    });
    return { status: 'Success', data: profile };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
export async function GetProfileByProfileId(id: number): Promise<QueryData> {
  try {
    const profile = await prismaClient.profile.findUnique({
      where: {
        id: id,
      },
    });
    return { status: 'Success', data: profile };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAllProfiles(): Promise<QueryData> {
  try {
    const profiles = await prismaClient.profile.findMany();
    return { status: 'Success', data: profiles };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetProfilesInOuting(id: number): Promise<QueryData> {
  try {
    const profiles = await prismaClient.profile.findMany({
      where: {
        outings: {
          some: {
            id,
          },
        },
      },
    });
    return { status: 'Success', data: profiles };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAllFriends(id: number): Promise<QueryData> {
  try {
    const friends = await prismaClient.profile.findMany({
      where: {
        id: id,
      },
      select: {
        friends: {
          select: {
            name: true,
            profile_img: true,
            social_pin: true,
          },
        },
      },
    });
    return { status: 'Success', data: friends };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

// NOTE probably don't need both findfriend methods, may get rid of one
// these methods will be used to search for a specific person to then send a request to
// they are not meant to find a friend WITHIN a list of friends
export async function FindFriendById(friend_id: number): Promise<QueryData> {
  try {
    const friend = await prismaClient.profile.findFirst({
      where: { id: friend_id },
    });
    return { status: 'Success', data: friend };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function FindFriendByPin(social_pin: string): Promise<QueryData> {
  try {
    const friend = await prismaClient.profile.findFirst({
      where: { social_pin },
    });
    return { status: 'Success', data: friend };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
