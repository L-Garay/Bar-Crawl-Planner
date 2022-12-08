import { prismaClient } from '../../index';
import { QueryData } from '../../types/sharedTypes';
import GetPrismaError from '../../utilities/getPrismaError';

export async function CreateAccount(
  email: string,
  email_verified: boolean
): Promise<QueryData> {
  try {
    const account = await prismaClient.account.create({
      data: {
        email,
        email_verified,
        created_at: new Date().toISOString(), // NOTE may want to pass in user's timezone here?
      },
    });

    return { status: 'Success', data: account };
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
    return { status: 'Success', user };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', error: newError };
    // NOTE need to figure out when/where to properly call this
    // presumably we don't want this snippet at the end of every function, more likely it should go around a parent wrapping handler
    // where the handler can handle the returned data/errors from all child functions, and then the handler can disconnect/exit if necessary
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
