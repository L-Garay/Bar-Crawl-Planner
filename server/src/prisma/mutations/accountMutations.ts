import prismaClient from '../../index';
import { PrismaError, QueryData } from '../../types/sharedTypes';
import { GetServerError } from '../../utilities';

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
        deactivated: false,
        deactivated_at: '',
        phone_number: '',
      },
    });

    return { status: 'Success', data: account };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function UpdateUserAccount(
  originalUserEmail: string,
  phone?: string | null,
  email?: string | null
) {
  // We want to make sure these are undefined (and not null) so that way Prisma will not try to update the field
  const phoneOrUndefinded = phone ? phone : undefined;
  const emailOrUndefined = email ? email : undefined;
  try {
    // update data in our DB
    const updatedUser = await prismaClient.account.update({
      where: {
        email: originalUserEmail,
      },
      data: {
        phone_number: phoneOrUndefinded,
        email: emailOrUndefined,
      },
    });
    // TODO update data in Auth0 DB

    return { status: 'Success', data: updatedUser };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function DeactivateUserAccount(id: number) {
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

    return { status: 'Success', data: deactivatedUser };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function UpdateAccountBySocialPin(
  profile_id: number,
  social_pin: string,
  email: string
) {
  try {
    const profile = await prismaClient.profile.findFirst({
      where: {
        id: profile_id,
        social_pin,
      },
    });
    const account = await prismaClient.account.findFirst({
      where: {
        id: profile?.account_Id,
      },
    });
    const updatedAccount = await prismaClient.account.update({
      where: {
        id: account?.id,
      },
      data: {
        email,
      },
    });
    return { status: 'Success', data: updatedAccount };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
