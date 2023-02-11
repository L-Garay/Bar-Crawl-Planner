import { prismaClient } from '../..';
import { OutingInput, QueryData } from '../../types/sharedTypes';
import { GetPrismaError } from '../../utilities';

export async function CreateOuting({
  name,
  created_at,
  start_date_and_time,
  place_ids,
  creatorId,
}: OutingInput & { creatorId: number }): Promise<QueryData> {
  try {
    const outing = await prismaClient.outing.create({
      data: {
        name,
        creator_profile_id: creatorId,
        created_at,
        start_date_and_time,
        place_ids,
        profiles: {
          connect: { id: creatorId },
        },
      },
    });
    return { status: 'Success', data: outing };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}
