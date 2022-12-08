import { prismaClient } from '../../index';
import { QueryData } from '../../types/sharedTypes';
import GetPrismaError from '../../utilities/getPrismaError';

export async function CreateProfile(
  name: string,
  profile_img: string,
  account_id: number
): Promise<QueryData> {
  try {
    // Apperently, if you manually just attach another data type's record's id, prisma or postgresql will automatically create the right relationship
    // I checked Prisma Studio after creating an account and profile (with no specific linking code yet) and they were already related/linked! #cool
    const profile = await prismaClient.profile.create({
      data: {
        name,
        profile_img,
        updated_at: new Date().toISOString(),
        account_Id: account_id,
      },
    });
    return { status: 'Success', data: profile };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}
