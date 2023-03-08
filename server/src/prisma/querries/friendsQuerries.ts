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
            frienshipStatus_friendship_relation: {
              none: {
                status_code: 'B', // blocked
              },
            },
          },
        ],
      },
      include: {
        frienshipStatus_friendship_relation: {
          select: {
            status_code: true,
            modifier_profile_id: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc', // grab the most recent status
          },
        },
      },
    });

    return { status: 'Success', data: friends, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
