import { prismaClient } from '../../index';
import GetPrismaError from '../../utilities/getPrismaError';
import { QueryData } from '../../types/sharedTypes';

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

    // We don't want to use .findUniqueOrThrow because if an account can't be found, that just indicates we need to create one
    if (data === null) return { status: 'Success', data: null };

    const expectedUser = { email: data?.email, name: data?.profile?.name };
    return { status: 'Success', data: expectedUser };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: newError };
  }
}
