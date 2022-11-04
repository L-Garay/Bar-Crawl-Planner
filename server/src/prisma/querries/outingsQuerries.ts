import { prismaClient } from '../../index';

export async function CreateOuting() {
  const date = new Date().toISOString();
  await prismaClient.basicOuting.create({
    data: {
      name: "Bob's Retirement",
      created_at: date,
      creator_id: 3, // NOTE don't like that this is hardcoded for now
    },
  });
  console.log('Basic Outing Created');
}

// CreateOuting()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

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

// GetAllOutings()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });

export async function GetOutingsByUser() {
  const outings = await prismaClient.basicUser.findFirst({
    where: {
      id: 3,
    },
    include: {
      outings: {
        select: {
          name: true,
        },
      },
    },
  });
  console.log(outings);
}

// GetOutingsByUser()
//   .then(async () => {
//     await prismaClient.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prismaClient.$disconnect();
//     process.exit(1);
//   });
