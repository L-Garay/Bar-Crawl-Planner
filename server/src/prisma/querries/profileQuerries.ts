import { prismaClient } from '../../index';
import { QueryData } from '../../types/sharedTypes';
import GetPrismaError from '../../utilities/getPrismaError';

export async function GetProfileByAccountId(id: number): Promise<QueryData> {
  try {
    const profile = await prismaClient.profile.findUnique({
      where: {
        id: id,
      },
    });
    return { status: 'Success', data: profile };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}

export async function GetAllProfiles(): Promise<QueryData> {
  try {
    const profiles = await prismaClient.profile.findMany();
    return { status: 'Success', data: profiles };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}

// GetAllProfiles()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

// export async function ConnectUserWithOuting() {
//   const user = await prismaClient.basicUser.update({
//     where: { id: 5 },
//     data: {
//       outings: {
//         connect: {
//           id: 4,
//         },
//       },
//     },
//     include: {
//       outings: true,
//     },
//   });
//   console.log(user);
// }

// export async function DisconnectUserWithOuting() {
//   const user = await prismaClient.basicUser.update({
//     where: { id: 5 },
//     data: {
//       outings: {
//         disconnect: { id: 4 },
//       },
//     },
//     include: {
//       outings: true,
//     },
//   });
//   console.log(user);
// }
