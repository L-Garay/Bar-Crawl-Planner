import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';

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
            status_code: 'A',
          },
        ],
      },
    });

    return { status: 'Success', data: friends, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetSentFriendRequests(
  profile_id: number
): Promise<PrismaData> {
  try {
    const sent = await prismaClient.friendship.findMany({
      where: {
        AND: [
          {
            requestor_profile_id: profile_id,
          },
          {
            status_code: 'S',
          },
        ],
      },
    });
    return { status: 'Success', data: sent, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetRecievedFriendRequests(
  profile_id: number
): Promise<PrismaData> {
  try {
    const recieved = await prismaClient.friendship.findMany({
      where: {
        AND: [
          {
            addressee_profile_id: profile_id,
          },
          {
            status_code: 'S',
          },
        ],
      },
    });
    return { status: 'Success', data: recieved, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetRecievedFriendRequestCount(
  profile_id: number
): Promise<PrismaData> {
  try {
    const recieved = await prismaClient.friendship.count({
      where: {
        AND: [
          {
            addressee_profile_id: profile_id,
          },
          {
            status_code: 'S',
          },
        ],
      },
    });
    return { status: 'Success', data: recieved, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
