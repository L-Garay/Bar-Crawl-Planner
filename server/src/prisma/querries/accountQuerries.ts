import prismaClient from '../../index';
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
export async function GetAccountByAccountId(id: number): Promise<PrismaData> {
  try {
    const user = await prismaClient.account.findFirst({
      where: {
        id: id,
      },
    });
    return { status: 'Success', data: user, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAllAccounts(): Promise<PrismaData> {
  try {
    const users = await prismaClient.account.findMany();
    return { status: 'Success', data: users, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAccountWithProfileData(
  email: string
): Promise<PrismaData> {
  try {
    const account = await prismaClient.account.findUnique({
      where: {
        email: email,
      },
      include: {
        profile: true,
      },
    });

    return { status: 'Success', data: account, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
