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
      include: {
        requestor_profile_relation: true,
        addressee_profile_relation: true,
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
      include: {
        addressee_profile_relation: {
          select: {
            name: true,
          },
        },
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
      include: {
        requestor_profile_relation: {
          select: {
            name: true,
          },
        },
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

export async function CheckFriendShipStatus(
  addressee_profile_id: number,
  requestor_profile_id: number
): Promise<PrismaData> {
  try {
    // This should find the friendship, if it exists, between the two profiles where if they are in one of these states we know they shouldn't be allowed to send another friend request.
    // Where the data value should either be 1 or 0
    const friendship = await prismaClient.friendship.count({
      where: {
        OR: [
          {
            requestor_profile_id,
            addressee_profile_id,
            status_code: 'S',
          },
          {
            requestor_profile_id,
            addressee_profile_id,
            status_code: 'A',
          },
          {
            requestor_profile_id,
            addressee_profile_id,
            status_code: 'B',
          },
          {
            requestor_profile_id: addressee_profile_id,
            addressee_profile_id: requestor_profile_id,
            status_code: 'S',
          },
          {
            requestor_profile_id: addressee_profile_id,
            addressee_profile_id: requestor_profile_id,
            status_code: 'A',
          },
          {
            requestor_profile_id: addressee_profile_id,
            addressee_profile_id: requestor_profile_id,
            status_code: 'B',
          },
        ],
      },
    });
    return { status: 'Success', data: friendship, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
