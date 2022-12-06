import { prismaClient } from '../../index';
import { QueryData } from './accountQuerries';
import GetPrismaError from './getPrismaError';

export async function CreateProfile(
  name: string,
  profile_img: string,
  account_id: number
): Promise<QueryData> {
  try {
    // Apperently, if you manually just attach another data type's record's id, prisma or postgresql will automatically create the right relationship
    // I checked Prisma Studio after creating an account and profile (with no specific linking code yet) and they were already related/linked! #cool
    const profile = await prismaClient.profile.create({
      data: {
        name,
        profile_img,
        updated_at: new Date().toISOString(),
        account_Id: account_id,
      },
    });
    return { status: 'Success', data: profile };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}

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
    // await prismaClient.$disconnect();
    // process.exit(1);
  }
}

export async function GetAllProfiles(): Promise<QueryData> {
  try {
    const profiles = await prismaClient.profile.findMany();
    return { status: 'Success', data: profiles };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
    // await prismaClient.$disconnect();
    // process.exit(1);
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
