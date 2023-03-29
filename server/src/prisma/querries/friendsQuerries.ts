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
      },
    });

    return { status: 'Success', data: friends, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
