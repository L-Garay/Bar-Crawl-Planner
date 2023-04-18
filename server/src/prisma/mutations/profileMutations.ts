import { Profile } from '@prisma/client';
import prismaClient from '../../index';
import { PrismaError, PrismaData } from '../../types/sharedTypes';
import { nanoid } from 'nanoid';

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
        social_pin: nanoid(8), // with 8 characters at 10 profiles created an hour would ~= 27years until a 1% chance of collision
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
  blocked_profile_id: number,
  friend_id: number
): Promise<PrismaData> {
  try {
    const updateFriend = prismaClient.friendship.update({
      where: {
        id: friend_id,
      },
      data: {
        modified_at: new Date().toISOString(),
        last_modified_by: user_profile_id,
        // status_code: 'B',
      },
    });
    const updateProfile = prismaClient.profile.update({
      where: {
        id: user_profile_id,
      },
      data: {
        blocked_profile_ids: {
          push: blocked_profile_id,
        },
      },
    });
    const [profile] = await prismaClient.$transaction([
      updateFriend,
      updateProfile,
    ]);
    return { status: 'Success', data: profile, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function UnblockProfile(
  profile: Profile,
  blocked_profile_id: number,
  friend_id: number
): Promise<PrismaData> {
  try {
    const updateFriendship = prismaClient.friendship.update({
      where: {
        id: friend_id,
      },
      data: {
        modified_at: new Date().toISOString(),
        last_modified_by: profile.id,
        status_code: 'R',
      },
    });
    const index = profile.blocked_profile_ids.indexOf(blocked_profile_id);
    profile.blocked_profile_ids.splice(index, 1);
    const updateProfile = prismaClient.profile.update({
      where: {
        id: profile.id,
      },
      data: {
        blocked_profile_ids: {
          set: profile.blocked_profile_ids,
        },
      },
    });
    const [updatedProfile] = await prismaClient.$transaction([
      updateFriendship,
      updateProfile,
    ]);
    return { status: 'Success', data: updatedProfile, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
