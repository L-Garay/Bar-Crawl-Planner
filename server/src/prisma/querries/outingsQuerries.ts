import prismaClient from '../../index';
import { PrismaError, QueryData } from '../../types/sharedTypes';
import { GetServerError } from '../../utilities';

export async function GetOutingByOutingId(
  outingId: number
): Promise<QueryData> {
  try {
    const outing = await prismaClient.outing.findUnique({
      where: {
        id: outingId,
      },
    });
    return { status: 'Success', data: outing };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAllOutings(creatorId: number): Promise<QueryData> {
  try {
    const createdOutings = await prismaClient.outing.findMany({
      where: {
        creator_profile_id: creatorId,
      },
    });
    const joinedOutings = await prismaClient.outing.findMany({
      where: {
        creator_profile_id: {
          not: creatorId,
        },
        profiles: {
          some: {
            id: creatorId,
          },
        },
      },
    });
    const outings = [...createdOutings, ...joinedOutings];
    return { status: 'Success', data: outings };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
