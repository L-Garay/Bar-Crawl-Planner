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

export async function GetCreatedOutings(
  creator_profile_id: number
): Promise<PrismaData> {
  try {
    const outings = await prismaClient.outing.findMany({
      where: {
        creator_profile_id: creator_profile_id,
      },
    });
    return { status: 'Success', data: outings, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetJoinedOutings(
  creator_profile_id: number
): Promise<PrismaData> {
  try {
    const outings = await prismaClient.outing.findMany({
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
    return { status: 'Success', data: outings, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetPendingOutings(
  profile_id: number
): Promise<PrismaData> {
  try {
    const outings = await prismaClient.outing.findMany({
      where: {
        pending_profiles: {
          some: {
            id: profile_id,
          },
        },
      },
      include: {
        pending_profiles: true,
      },
    });
    return { status: 'Success', data: outings, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetPendingOutingsCount(
  profile_id: number
): Promise<PrismaData> {
  try {
    const count = await prismaClient.outing.count({
      where: {
        pending_profiles: {
          some: {
            id: profile_id,
          },
        },
      },
    });
    return { status: 'Success', data: count, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
