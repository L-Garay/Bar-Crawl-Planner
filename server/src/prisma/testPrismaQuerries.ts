// import { PrismaClient } from '@prismaClient/client';
// import { prismaClient } from '../index';

import { PrismaClient } from '@prisma/client';

export const prismaClient = new PrismaClient();

// async function GetAll() {
//   const allBasicUsers = await prismaClient.basicUser.findMany();
//   console.log('All Basic Users', allBasicUsers);
//   const allBasicOutings = await prismaClient.basicOuting.findMany();
//   console.log('All Basic Outings', allBasicOutings);
// }

// GetAll()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

// async function CreateUser() {
//   await prismaClient.basicUser.create({
//     data: {
//       name: 'Bob Vance',
//     },
//   });
//   console.log('Basic User Created');
// }

// export async function GetAllUsers() {
//   try {
//     const users = await prismaClient.basicUser.findMany();
//     console.log(users);
//     return users;
//   } catch (error) {
//     console.error(error);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   }
// }

// GetAllUsers()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

export async function GetAllUsersWithOutings() {
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

GetAllUsersWithOutings()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });

export async function GetAllOutings() {
  try {
    const outings = await prismaClient.basicOuting.findMany();
    console.log(outings);
    return outings;
  } catch (error) {
    console.error(error);
    await prismaClient.$disconnect();
    process.exit(1);
  }
}

GetAllOutings()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });

// CreateUser()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

// async function CreateManyUsers() {
//   await prismaClient.basicUser.createMany({
//     data: [
//       { name: 'Michael Scott' },
//       { name: 'Bob Vance' },
//       { name: 'Pam Beasley' },
//     ],
//   });
//   console.log('Many Basic Users Created');
// }

// CreateManyUsers()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

// async function CreateOuting() {
//   const date = new Date();
//   await prismaClient.basicOuting.create({
//     data: {
//       name: "Bob's Retirement",
//       date: date,
//       creator: {
//         connect: { id: 2 },
//       },
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

// This was created before latest schema and DB changes, may need to refactor some
// async function UpdateUserWithOuting() {
//   const userIdArray = [4, 3, 2];
//   userIdArray.forEach(async (id) => {
//     console.log(id);

//     const user = await prismaClient.basicUser.update({
//       where: { id: id },
//       data: {
//         outings: {
//           connect: {
//             id: 1,
//           },
//         },
//       },
//     });
//     console.log(user);
//   });
// }

// async function ConnectUserWithOuting() {
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

// ConnectUserWithOuting()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

// async function DisconnectUserWithOuting() {
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

// DisconnectUserWithOuting()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

// async function GetOutingsByUser() {
//   const outings = await prismaClient.basicUser.findFirst({
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

// async function CreateUserThenOuting() {
//   const date = new Date();
//   const date2 = new Date();
//   const userOuting = await prismaClient.basicUser.create({
//     data: {
//       name: 'Jim Halpert',
//       outings: {
//         create: [
//           {
//             name: "Pam's birthday",
//             created_at: date,
//             creator_id: 1, // not a fan of hardcoding this, will need to find proper way to set this in future. Maybe split this into two seperate steps, create the user first then grab their generated id and then create the outing(s) with that generated user id?
//           },
//           {
//             name: "Bob's retirement",
//             created_at: date2,
//             creator_id: 1,
//           },
//         ],
//       },
//     },
//   });
//   console.log(userOuting);
// }

// CreateUserThenOuting()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });
