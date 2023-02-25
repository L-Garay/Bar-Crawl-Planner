import prismaClient from '../../index';
import { PrismaError, PrismaData } from '../../types/sharedTypes';

export async function GetOutingByOutingId(
  outingId: number
): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.findUnique({
      where: {
        id: outingId,
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAllOutings(creatorId: number): Promise<PrismaData> {
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
        accepted_profiles: {
          some: {
            id: creatorId,
          },
        },
      },
    });
    const outings = [...createdOutings, ...joinedOutings];
    return { status: 'Success', data: outings, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
