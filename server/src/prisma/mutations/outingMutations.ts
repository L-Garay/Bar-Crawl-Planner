import { prismaClient } from '../..';
import { OutingInput, QueryData } from '../../types/sharedTypes';
import { GetPrismaError } from '../../utilities';

export async function CreateOuting({
  name,
  creator_profile_id,
  created_at,
  start_date_and_time,
  place_ids,
}: OutingInput): Promise<QueryData> {
  try {
    const outing = await prismaClient.outing.create({
      data: {
        name,
        creator_profile_id,
        created_at,
        start_date_and_time,
        place_ids,
        profiles: {
          connect: { id: creator_profile_id },
        },
      },
    });
    return { status: 'Success', data: outing };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}
