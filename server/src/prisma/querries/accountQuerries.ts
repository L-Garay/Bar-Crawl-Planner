import prismaClient from '../../index';
import { GetServerError } from '../../utilities';
import { PrismaError, PrismaData } from '../../types/sharedTypes';

export async function GetAccountByEmail(email: string): Promise<PrismaData> {
  try {
    const user = await prismaClient.account.findFirst({
      where: {
        email: email,
      },
    });
    return { status: 'Success', data: user, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAllAccounts(): Promise<PrismaData> {
  try {
    const users = await prismaClient.account.findMany({
      where: {
        id: 2,
      },
    });
    return { status: 'Success', data: users, error: null };
  } catch (error) {
    console.log('ERROR BEING SENT TO GETPRISMAERROR', error);
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAccountWithProfileData(
  email: string
): Promise<PrismaData> {
  try {
    const data = await prismaClient.account.findUnique({
      where: {
        email: email,
      },
      include: {
        profile: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    // We don't want to use .findUniqueOrThrow because if an account can't be found, that just indicates we need to create one
    if (data === null) return { status: 'Success', data: null, error: null };

    const expectedUser = { email: data?.email, name: data?.profile?.name };
    return { status: 'Success', data: expectedUser, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
