import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function GetAll() {
  const allBasicUsers = await prisma.basicUser.findMany();
  console.log('All Basic Users', allBasicUsers);
  const allBasicOutings = await prisma.basicOuting.findMany();
  console.log('All Basic Outings', allBasicOutings);
}

GetAll()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// async function CreateUser() {
//   await prisma.basicUser.create({
//     data: {
//       name: 'Bob Vance',
//     },
//   });
//   console.log('Basic User Created');
// }

// CreateUser()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

// async function CreateManyUsers() {
//   await prisma.basicUser.createMany({
//     data: [
//       { name: 'Michael Scott' },
//       { name: 'Jim Halpert' },
//       { name: 'Pam Beasley' },
//     ],
//   });
//   console.log('Many Basic Users Created');
// }

// CreateManyUsers()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

// async function CreateOuting() {
//   const date = new Date("2023-01-13T20:00:00");
//   await prisma.basicOuting.create({
//     data: {
//       name: "Jim's Birthday",
//       date: date,
//       creator: {
//         connect: { id: 4 },
//       },
//     },
//   });
//   console.log('Basic User Created');
// }

// CreateOuting()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

// async function UpdateUserWithOuting() {
//   const userIdArray = [4, 3, 2];
//   userIdArray.forEach(async (id) => {
//     console.log(id);

//     const user = await prisma.basicUser.update({
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

async function UpdateUserWithOuting() {
  const user = await prisma.basicUser.update({
    where: { id: 4 },
    data: {
      outings: {
        connect: {
          id: 1,
        },
      },
    },
  });
  console.log(user);
}

UpdateUserWithOuting()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
