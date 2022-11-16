import { prismaClient } from '../../index';
import GetPrismaError from './getPrismaError';

export type QueryData = {
  status: string;
  data: any;
};

export async function CreateAccountAndProfile() {
  const now = new Date().toISOString();
  try {
    const user = await prismaClient.account.create({
      data: {
        email: 'logangaray+barcrawl3@gmail.com',
        email_verified: false,
        created_at: now,
        profile: {
          create: {
            name: 'Jimmy Pesto',
            profile_img: '',
            updated_at: now,
          },
        },
      },
    });
    console.log('Basic Account and Profile Created');
    return { status: 'Success', user };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', error: newError };
    // NOTE need to figure out when/where to properly call this
    // presumably we don't want this snippet at the end of every function, more likely it should go around a parent wrapping handler
    // where the handler can handle the returned data/errors from all child functions, and then the handler can disconnect/exit if necessary
    // is this necessary?
    // await prismaClient.$disconnect();
    // process.exit(1);
  }
}

// CreateAccountAndProfile()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

export async function GetAccountByEmail(email: string): Promise<QueryData> {
  try {
    const user = await prismaClient.account.findFirst({
      where: {
        email: email,
      },
    });
    return { status: 'Success', data: user };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}

export async function GetAllAccounts(): Promise<QueryData> {
  try {
    const users = await prismaClient.account.findMany();
    console.log(users);
    return { status: 'Success', data: users };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}