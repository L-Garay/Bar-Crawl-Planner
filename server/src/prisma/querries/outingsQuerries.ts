import { prismaClient } from '../../index';
import { QueryData } from './accountQuerries';
import GetPrismaError from '../../utilities/getPrismaError';

// NOTE you will only need to uncomment out the function invocations when attempting to seed/setup data in the DB

// export async function CreateOuting() {
//   const date = new Date().toISOString();
//   const start = new Date('06-15-2023').toISOString();
//   await prismaClient.outing.create({
//     data: {
//       name: "Michael's Birthday",
//       created_at: date,
//       creator_id: 2, // NOTE don't like that this is hardcoded for now
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
    // await prismaClient.$disconnect();
    // process.exit(1);
  }
}

export async function GetAllOutings(): Promise<QueryData> {
  try {
    const outings = await prismaClient.outing.findMany();
    return { status: 'Success', data: outings };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
    // await prismaClient.$disconnect();
    // process.exit(1);
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
