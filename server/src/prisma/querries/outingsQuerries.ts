import { prismaClient } from '../../index';
import { QueryData } from '../../types/sharedTypes';
import GetPrismaError from '../../utilities/getPrismaError';

export async function GetOutingByOutingId(
  outingId: number
): Promise<QueryData> {
  try {
    const outings = await prismaClient.outing.findUnique({
      where: {
        id: outingId,
      },
    });
    return { status: 'Success', data: outings };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}

export async function GetAllOutings(): Promise<QueryData> {
  try {
    const outings = await prismaClient.outing.findMany();
    return { status: 'Success', data: outings };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
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
