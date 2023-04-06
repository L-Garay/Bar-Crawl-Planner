import { Profile } from '@prisma/client';
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
      include: {
        profile: true,
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

export async function GetBlockedAccountEmails(
  emails: string[],
  profile: Profile
): Promise<PrismaData> {
  try {
    // get accounts with related profile data using emails
    const accountsWithProfile = await Promise.all(
      emails.map(async (email: string) => {
        return await GetAccountWithProfileData(email);
      })
    );

    accountsWithProfile.forEach((account: PrismaData) => {
      if (account.status === 'Failure') {
        // what should we do in this case?
        console.log(account.error?.message, 'error message');
      }
    });

    // filter out accounts that have blocked the user or the user has blocked
    const blockedAccounts = accountsWithProfile.filter(
      (account: PrismaData) => {
        // if we were unable to get an account with the email, there will be no data property
        if (!account.data) return false;

        const { profile: accountProfile } = account.data;

        const hasBlockedUser = accountProfile.blocked_profile_ids.includes(
          profile.id
        );
        const userHasBlocked = profile.blocked_profile_ids.includes(
          accountProfile.id
        );

        if (hasBlockedUser || userHasBlocked) {
          return true;
        } else {
          return false;
        }
      }
    );

    // get the emails from the accounts
    const blockedEmails = blockedAccounts.map(
      (account: PrismaData) => account.data.email
    );

    return { status: 'Success', data: blockedEmails, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetAccountEmails(
  account_Ids: number[]
): Promise<PrismaData> {
  try {
    const emails = await Promise.allSettled(
      account_Ids.map(async (id: number) => {
        const email = await prismaClient.account.findUnique({
          where: {
            id: id,
          },
          select: {
            email: true,
          },
        });
        return email;
      })
    );
    console.log(emails, 'from get account emails');
    const accountEmails = emails
      .map((promise) => {
        if (promise.status === 'fulfilled') {
          return promise.value;
        } else {
          console.log(promise.reason);
          return null;
        }
      })
      .filter((email) => email !== null);
    console.log(accountEmails, 'account emails');
    return { status: 'Success', data: accountEmails, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
