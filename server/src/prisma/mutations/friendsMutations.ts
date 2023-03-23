import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';

export async function AddFriend(
  requestor_profile_id: number,
  addressee_profile_id: number
): Promise<PrismaData> {
  console.log('requestor_profile_id: ', requestor_profile_id);
  console.log('addressee_profile_id: ', addressee_profile_id);

  try {
    const friend = await prismaClient.friendship.create({
      data: {
        created_at: new Date().toISOString(),
        requestor_profile_id,
        addressee_profile_id,
        frienshipStatus_friendship_relation: {
          create: {
            status_code: 'A',
            created_at: new Date().toISOString(),
            modifier_profile_id: addressee_profile_id, // because the addressee is the one who accepted the request, they are the modifier
          },
        },
      },
    });
    return { status: 'Success', data: friend, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
