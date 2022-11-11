import { prismaClient } from '../../index';
import GetPrismaError from './getPrismaError';

export async function CreateUser() {
  try {
    const user = await prismaClient.basicUser.create({
      data: {
        name: 'logangaray+barcrawl1@gmail.com',
      },
    });
    console.log('Basic User Created');
    return { status: 'Success', user };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', error: newError };
  }
}

// CreateUser()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

export async function CreateManyUsers() {
  await prismaClient.basicUser.createMany({
    data: [
      { name: 'Michael Scott' },
      { name: 'Bob Vance' },
      { name: 'Pam Beasley' },
    ],
  });
  console.log('Many Basic Users Created');
}

// CreateManyUsers()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

export async function GetAllUsers() {
  try {
    const users = await prismaClient.basicUser.findMany();
    console.log(users);
    return users;
  } catch (error) {
    console.error(error);
    await prismaClient.$disconnect();
    process.exit(1);
  }
}

// GetAllUsers()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

// NOTE right now this is actually checking the user's name, but in the future this will check their email
export async function GetUserByEmail(email: string) {
  try {
    const user = await prismaClient.basicUser.findFirst({
      where: {
        name: email,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    await prismaClient.$disconnect();
    process.exit(1);
  }
}

export async function ConnectUserWithOuting() {
  const user = await prismaClient.basicUser.update({
    where: { id: 5 },
    data: {
      outings: {
        connect: {
          id: 4,
        },
      },
    },
    include: {
      outings: true,
    },
  });
  console.log(user);
}

// ConnectUserWithOuting()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

export async function DisconnectUserWithOuting() {
  const user = await prismaClient.basicUser.update({
    where: { id: 5 },
    data: {
      outings: {
        disconnect: { id: 4 },
      },
    },
    include: {
      outings: true,
    },
  });
  console.log(user);
}

// DisconnectUserWithOuting()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });
