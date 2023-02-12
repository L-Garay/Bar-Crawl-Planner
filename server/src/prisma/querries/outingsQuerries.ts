import { prismaClient } from '../../index';
import { QueryData } from '../../types/sharedTypes';
import { GetPrismaError } from '../../utilities';

export async function GetOutingByOutingId(
  outingId: number
): Promise<QueryData> {
  try {
    const outing = await prismaClient.outing.findUnique({
      where: {
        id: outingId,
      },
    });
    return { status: 'Success', data: outing };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}

export async function GetAllOutings(creatorId: number): Promise<QueryData> {
  try {
    const createdOutings = await prismaClient.outing.findMany({
      where: {
        creator_profile_id: creatorId,
      },
    });
    const joinedOutings = await prismaClient.outing.findMany({
      where: {
        creator_profile_id: {
          not: creatorId,
        },
        profiles: {
          some: {
            id: creatorId,
          },
        },
      },
    });
    const outings = [...createdOutings, ...joinedOutings];
    return { status: 'Success', data: outings };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}

// GetAllOutings()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

// NOTE This hardcoded data is for seeding the DB
// When it's time to actually have users create outings, you can just copy this function and strip out the hardcoded data
// export async function CreateOuting() {
//   const date = new Date().toISOString();
//   const start = new Date('06-15-2023').toISOString();
//   await prismaClient.outing.create({
//     data: {
//       name: "Michael's Birthday",
//       created_at: date,
//       creator_id: 2,
//       start_date_and_time: start,
//     },
//   });
//   console.log('Basic Outing Created');
// }

// CreateOuting()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

// export async function GetOutingsByUser() {
//   const outings = await prismaClient.profile.findFirst({
//     where: {
//       id: 3,
//     },
//     include: {
//       outings: {
//         select: {
//           name: true,
//         },
//       },
//     },
//   });
//   console.log(outings);
// }

// GetOutingsByUser()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });
