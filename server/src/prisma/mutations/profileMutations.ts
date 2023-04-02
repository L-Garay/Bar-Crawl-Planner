import { Profile } from '@prisma/client';
import prismaClient from '../../index';
import { PrismaError, PrismaData } from '../../types/sharedTypes';
import short from 'short-uuid';

export async function CreateProfile(
  name: string = 'New User',
  profile_img: string,
  account_Id: number
): Promise<PrismaData> {
  try {
    const profile = await prismaClient.profile.create({
      data: {
        name,
        profile_img,
        updated_at: new Date().toISOString(),
        account_Id: account_Id,
        social_pin: short.generate(),
      },
    });
    return { status: 'Success', data: profile, error: null };
  } catch (error) {
    console.log(error);
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function BlockProfile(
  user_profile_id: number,
  blocked_profile_id: number
): Promise<PrismaData> {
  try {
    const profile = await prismaClient.profile.update({
      where: {
        id: user_profile_id,
      },
      data: {
        blocked_profile_ids: {
          push: blocked_profile_id,
        },
      },
    });
    return { status: 'Success', data: profile, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function UnblockProfile(
  profile: Profile,
  blocked_profile_id: number
): Promise<PrismaData> {
  try {
    const index = profile.blocked_profile_ids.indexOf(blocked_profile_id);
    profile.blocked_profile_ids.splice(index, 1);
    const updatedProfile = await prismaClient.profile.update({
      where: {
        id: profile.id,
      },
      data: {
        blocked_profile_ids: {
          set: profile.blocked_profile_ids,
        },
      },
    });
    return { status: 'Success', data: updatedProfile, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
