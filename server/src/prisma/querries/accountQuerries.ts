import { prismaClient } from '../../index';
import GetPrismaError from './getPrismaError';

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
