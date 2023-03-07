import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';

export async function TestAddFriend(
  user_id: number,
  friend_id: number
): Promise<PrismaData> {
  console.log('user_id: ', user_id);
  console.log('friend_id: ', friend_id);

  try {
    await prismaClient.friendship.create({
      data: {
        created_at: new Date().toISOString(),
        requestor_profile_id: user_id,
        addressee_profile_id: friend_id,
      },
    });
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }

  try {
    const friendStatus = await prismaClient.friendshipStatus.create({
      data: {
        status_code: 'R',
        created_at: new Date().toISOString(),
        requestor_profile_id: user_id,
        modifier_profile_id: user_id,
        addressee_profile_id: friend_id,
      },
    });
    return { status: 'Success', data: friendStatus, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
