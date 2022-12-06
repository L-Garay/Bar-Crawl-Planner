import { prismaClient } from '../../index';
import GetPrismaError from './getPrismaError';

export type QueryData = {
  status: string;
  data: any;
};

export async function CreateAccount(
  email: string,
  email_verified: boolean
): Promise<QueryData> {
  try {
    const account = await prismaClient.account.create({
      data: {
        email,
        email_verified,
        created_at: new Date().toISOString(),
      },
    });

    return { status: 'Success', data: account };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}

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

export async function GetAccountWithProfileData(
  email: string
): Promise<QueryData> {
  try {
    // NOTE may want to check if the data is 'null', which means no one was found
    // depending on the situation in which this method is called, it may change what the side effects should be
    const data = await prismaClient.account.findUnique({
      where: {
        email: email,
      },
      include: {
        profile: {
          select: {
            name: true,
          },
        },
      },
    });

    if (data === null) return { status: 'Success', data: null };

    const expectedUser = { email: data?.email, name: data?.profile?.name };
    return { status: 'Success', data: expectedUser };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}

// TESTING/SEEDING
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
