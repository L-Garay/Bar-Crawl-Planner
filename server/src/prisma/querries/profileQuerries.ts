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
    return { status: 'Failure', data: null, error: newError };
  }
}

export async function GetAllProfiles(): Promise<QueryData> {
  try {
    const profiles = await prismaClient.profile.findMany();
    return { status: 'Success', data: profiles };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}

export async function GetAllFriends(id: number): Promise<QueryData> {
  try {
    const friends = await prismaClient.profile.findMany({
      where: {
        id,
      },
      select: {
        friends: true,
      },
    });
    return { status: 'Success', data: friends };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}

// NOTE probably don't need all 3 findfriend methods, need to determine which ones I 'should' be using and clean up other(s)
export async function FindFriendById(friend_id: number): Promise<QueryData> {
  try {
    const friend = await prismaClient.profile.findFirst({
      where: { id: friend_id },
    });
    return { status: 'Success', data: friend };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}

export async function FindFriendByPin(social_pin: string): Promise<QueryData> {
  try {
    const friend = await prismaClient.profile.findFirst({
      where: { social_pin },
    });
    return { status: 'Success', data: friend };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
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
