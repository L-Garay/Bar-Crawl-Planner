import prismaClient from '../../index';
import { PrismaError, PrismaData } from '../../types/sharedTypes';
import short from 'short-uuid';

export async function CreateProfile(
  name: string = 'New User',
  profile_img: string,
  account_id: number
): Promise<PrismaData> {
  try {
    const profile = await prismaClient.profile.create({
      data: {
        name,
        profile_img,
        updated_at: new Date().toISOString(),
        account_Id: account_id,
        social_pin: short.generate(),
      },
    });
    return { status: 'Success', data: profile, error: null };
  } catch (error) {
    console.log(error);
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
