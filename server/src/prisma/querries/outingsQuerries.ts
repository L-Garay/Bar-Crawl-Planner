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

export async function GetAllOutings(
  creator_profile_id: number
): Promise<PrismaData> {
  try {
    const createdOutings = await prismaClient.outing.findMany({
      where: {
        creator_profile_id: creator_profile_id,
      },
    });
    const joinedOutings = await prismaClient.outing.findMany({
      where: {
        creator_profile_id: {
          not: creator_profile_id,
        },
        accepted_profiles: {
          some: {
            id: creator_profile_id,
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
