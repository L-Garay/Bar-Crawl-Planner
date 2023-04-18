import prismaClient from '../../index';
import { PrismaError, PrismaData } from '../../types/sharedTypes';

export async function CreateAccount(
  email: string,
  email_verified: boolean
): Promise<PrismaData> {
  try {
    const account = await prismaClient.account.create({
      data: {
        email,
        email_verified,
        created_at: new Date().toISOString(), // NOTE may want to pass in user's timezone here?
        deactivated: false,
        deactivated_at: '',
        phone_number: '',
      },
    });

    return { status: 'Success', data: account, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function UpdateUserAccount(
  originalUserEmail: string,
  phone?: string | null
): Promise<PrismaData> {
  // We want to make sure these are undefined (and not null) so that way Prisma will not try to update the field
  const phoneOrUndefinded = phone ? phone : undefined;
  try {
    const updatedUser = await prismaClient.account.update({
      where: {
        email: originalUserEmail,
      },
      data: {
        phone_number: phoneOrUndefinded,
      },
    });

    return { status: 'Success', data: updatedUser, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function DeactivateUserAccount(id: number): Promise<PrismaData> {
  try {
    const deactivatedUser = await prismaClient.account.update({
      where: {
        id,
      },
      data: {
        deactivated: true,
        deactivated_at: new Date().toISOString(),
      },
    });

    return { status: 'Success', data: deactivatedUser, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function UpdateAccountBySocialPin(
  account_id: number,
  email: string
): Promise<PrismaData> {
  try {
    const updatedAccount = await prismaClient.account.update({
      where: {
        id: account_id,
      },
      data: {
        email,
      },
    });
    return { status: 'Success', data: updatedAccount, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
