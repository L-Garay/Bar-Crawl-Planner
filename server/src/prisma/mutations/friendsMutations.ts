import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';

export async function AddFriend(
  requestor_profile_id: number,
  addressee_profile_id: number
): Promise<PrismaData> {
  console.log('requestor_profile_id: ', requestor_profile_id);
  console.log('addressee_profile_id: ', addressee_profile_id);

  try {
    await prismaClient.friendship.create({
      data: {
        created_at: new Date().toISOString(),
        requestor_profile_id,
        addressee_profile_id,
      },
    });
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }

  try {
    const friendStatus = await prismaClient.friendshipStatus.create({
      data: {
        status_code: 'A',
        created_at: new Date().toISOString(),
        requestor_profile_id,
        modifier_profile_id: addressee_profile_id, // because the addressee is the one who accepted the request, they are the modifier
        addressee_profile_id,
      },
    });
    return { status: 'Success', data: friendStatus, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
