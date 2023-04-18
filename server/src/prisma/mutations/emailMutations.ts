import { Account, Profile } from '@prisma/client';
import { nanoid } from 'nanoid';
import prismaClient from '../..';
import {
  Email,
  PrismaData,
  SendingOutingInvitesInput,
  GenerateOutingInviteEmailsWithAccountsInput,
  SendingOutingInvitesAndCreateInput,
  OutingInviteProfiles,
  GenerateOutingInviteEmailWithProfilesInput,
} from '../../types/sharedTypes';
import {
  GenerateOutingInviteEmailWithAccounts,
  GenerateOutingInviteEmailWithProfiles,
  GenerateOutingJoinedEmail,
} from '../../utilities/generateEmails';
import GetEmailTools from '../../utilities/generateEmails/getEmailTools';
import { GetAccountByAccountId } from '../querries/accountQuerries';
import { GetOutingByOutingId } from '../querries/outingsQuerries';
import { GetAcceptedProfilesInOuting } from '../querries/profileQuerries';
import { AddPendingUserToOuting } from './outingMutations';

const GenerateAndSend = async (
  generatedEmails: Email[],
  successfulEmailsToSend: string[]
): Promise<PrismaData> => {
  const { generator, transporter } = GetEmailTools();

  if (!generator || !transporter) {
    return {
      status: 'Failure',
      data: null,
      error: {
        name: 'Email composition error', // not sure what to call this
        message: 'Unable to create email generator or transporter',
      },
    };
  }

  // generate the html emails using mailgen generator
  const emailsToSend = generatedEmails.map((email: Email) =>
    generator.generate(email)
  );
  console.log('emailsToSend:\n', emailsToSend.length);
  // const textEmailsToSend = generatedEmails.map((email) => generator.generatePlaintext(email));

  // set the mail options for each email
  const mailOptions = emailsToSend.map((email: Email, index: number) => {
    return {
      from: process.env.GMAIL_EMAIL,
      to: successfulEmailsToSend[index],
      subject: 'Bar Crawl Invite',
      html: email,
    };
  });

  // use nodemailer transport to send the emails
  const emailResponse = await Promise.allSettled(
    mailOptions.map((mailOption: Record<string, any>) =>
      transporter.sendMail(mailOption)
    )
  );

  // log failed emails
  emailResponse.forEach((response: any, index: number) => {
    if (response.status === 'rejected') {
      // TODO log to some loggin service
      console.log(`Error sending some emails\n` + response.reason);
    }
  });
  const successfulEmails = emailResponse.filter(
    (response: any) => response.status === 'fulfilled'
  );
  const successString = successfulEmails.length > 1 ? 's' : '';
  return {
    status: 'Success',
    data: `Sucessfully sent ${successfulEmails.length} email${successString}!`,
    error: null,
  };
};

export async function SendOutingInvites({
  outing_id,
  outing_name,
  start_date_and_time,
  accounts,
  senderName,
}: SendingOutingInvitesInput): Promise<PrismaData> {
  if (!accounts || accounts.length === 0) {
    console.log('No accounts provided');

    return {
      status: 'Success',
      data: 'No accounts provided or accounts already accepted',
      error: null,
    };
  }

  const emails = accounts
    .map((account) => {
      if (account === null) {
        return null;
      }
      return account.email;
    })
    .filter((email) => email != null || email != undefined) as string[];
  // need to add profiles to outing
  const profileIds = accounts
    .map((account) => {
      if (account === null) {
        return null;
      }
      return account.profile.id;
    })
    .filter(
      (profileId) => profileId != null || profileId != undefined
    ) as number[];

  const connectionResults = await Promise.allSettled(
    profileIds.map(
      async (profileId) => await AddPendingUserToOuting(outing_id, profileId)
    )
  );
  //  I don't believe any of the actual promises will fail, as the try/catch should catch the errors and return a JSON object (but this may still trigger the a rejection)
  const failedConnectionProfileIds = connectionResults.map((promise) => {
    if (promise.status === 'fulfilled') {
      console.log(promise.value.error);
      return promise.value.data.profileId;
    }
  });
  const failedConnectionEmails = accounts
    .filter((account) => {
      if (failedConnectionProfileIds.includes(account.profile.id)) {
        return true;
      } else {
        return false;
      }
    })
    .map((account) => account.email);
  const successfulEmailsToSend = emails.filter((email) => {
    if (failedConnectionEmails.includes(email)) {
      return false;
    } else {
      return true;
    }
  });
  const successfulAccounts = accounts.filter((account) => {
    if (successfulEmailsToSend.includes(account.email)) {
      return true;
    } else {
      return false;
    }
  });

  const generateEmailInput: GenerateOutingInviteEmailsWithAccountsInput = {
    outing_name,
    outing_id,
    start_date_and_time,
    accounts: successfulAccounts,
    senderName,
  };

  // generate the email templates
  const generatedEmails =
    GenerateOutingInviteEmailWithAccounts(generateEmailInput);

  // generate the html emails and send them
  const emailResponse = await GenerateAndSend(
    generatedEmails,
    successfulEmailsToSend
  );

  if (emailResponse.status === 'Failure') {
    return { status: 'Failure', data: null, error: emailResponse.error };
  } else {
    return { status: 'Success', data: emailResponse.data, error: null };
  }
}

export async function SendOutingInvitesAndCreate({
  outing_id,
  start_date_and_time,
  emails,
  senderName,
}: SendingOutingInvitesAndCreateInput): Promise<PrismaData> {
  if (!emails || emails.length === 0) {
    console.log('No emails provided');

    return {
      status: 'Success',
      data: 'No emails provided or emails already accepted',
      error: null,
    };
  }

  const filteredEmails = emails.filter((email) => {
    if (email === null || email === undefined) return false;
    return true;
  });
  // get the accounts associated with the input emails
  const accounts: Promise<Account | null>[] = filteredEmails.map(
    async (email) => {
      const account = await prismaClient.account.findFirst({
        where: {
          email: email,
        },
      });
      return account;
    }
  );
  const resolvedAccounts = await Promise.allSettled(accounts);

  // if an account doesn't exist, create one
  const createdAccounts: Promise<Account | null>[] = resolvedAccounts.map(
    async (account, index) => {
      if (account.status === 'rejected') return null; // don't expect this to happen
      if (account.status === 'fulfilled' && account.value) {
        // if there is a valid account, return it
        return account.value;
      } else {
        // otherwise, create a new account
        try {
          const newAccount: Account = await prismaClient.account.create({
            data: {
              email: filteredEmails[index],
              created_at: new Date().toISOString(),
            },
          });
          return newAccount;
        } catch (error) {
          console.log(
            `Unable to create new account for email ${filteredEmails[index]}`
          );
          return null;
        }
      }
    }
  );
  const resolvedCreatedAccounts = await Promise.allSettled(createdAccounts);

  // get the profiles associated with the accounts
  // if the profile is already connected to the outing (accepted), don't include it
  // if a profile doesn't exist, create one
  const profiles: Promise<Profile | null>[] = resolvedCreatedAccounts.map(
    async (account) => {
      const noAccount =
        (account.status && account.status === 'rejected') ||
        account.value == undefined ||
        account.value == null;
      if (noAccount) return null;
      if (account.status === 'fulfilled' && account.value !== null) {
        const profile = await prismaClient.profile.findFirst({
          where: {
            account_Id: account.value.id,
          },
        });
        if (profile == null) {
          const newProfile: Profile = await prismaClient.profile.create({
            data: {
              name: 'New Profile', // not sure what to put here
              account_Id: account.value.id,
              profile_img: '',
              updated_at: new Date().toISOString(),
              social_pin: nanoid(8),
            },
            include: {
              account: true,
            },
          });
          return newProfile;
        }
        return profile;
      } else {
        return null;
      }
    }
  );

  // filter out any null profiles and then format them to only include relevant data
  const resolvedProfiles = (await Promise.all(profiles))
    .filter((profile) => profile != null || profile != undefined)
    .map((profile) => {
      return {
        id: profile?.id,
        name: profile?.name,
        social_pin: profile?.social_pin,
      } as OutingInviteProfiles;
    });

  // connect the profiles to the outing
  const connectionResults = await Promise.allSettled(
    resolvedProfiles.map(
      async (profile) => await AddPendingUserToOuting(outing_id, profile.id)
    )
  );

  const failedConnectionProfileIds = connectionResults.map((promise) => {
    // if the connection was successful, there should not be a data.profileId property
    if (promise.status === 'fulfilled' && promise.value.data.profileId) {
      console.log(promise.value.error, promise.value.data.profileId);
      return promise.value.data.profileId;
    }
  });

  const failedConnectionEmails = resolvedCreatedAccounts
    .map((promise) => {
      if (
        promise.status === 'fulfilled' &&
        promise.value &&
        (promise.value != null || promise.value != undefined)
      ) {
        if (failedConnectionProfileIds.includes(promise.value.id)) {
          return promise.value.email;
        } else {
          return null;
        }
      } else {
        return null;
      }
    })
    .filter((email) => email != null || email != undefined) as string[];

  const successfulEmailsToSend = emails.filter((email) => {
    if (failedConnectionEmails.includes(email)) {
      return false;
    } else {
      return true;
    }
  });
  console.log('successfulEmailsToSend:\n', successfulEmailsToSend);

  const successfulProfiles = resolvedProfiles
    .map((profile) => {
      if (failedConnectionProfileIds.includes(profile.id)) {
        return null;
      } else {
        return profile;
      }
    })
    .filter(
      (profile) => profile != null || profile != undefined
    ) as OutingInviteProfiles[];
  console.log('successfulProfiles:\n', successfulProfiles);

  // TODO pass the outing name from the client, since we already have it, to avoid making another db call
  const outing = await GetOutingByOutingId(outing_id);
  if (outing.status === 'Failure') {
    return { status: 'Failure', data: null, error: outing.error };
  }

  // generate the email inputs to be used in constructing the email
  const generateEmailInput: GenerateOutingInviteEmailWithProfilesInput = {
    outing_name: outing.data.name,
    outing_id,
    start_date_and_time,
    profiles: successfulProfiles,
    senderName,
  };

  // generate the email templates
  const generatedEmails =
    GenerateOutingInviteEmailWithProfiles(generateEmailInput);

  // generate the html emails and send them
  const emailResponse = await GenerateAndSend(
    generatedEmails,
    successfulEmailsToSend
  );

  if (emailResponse.status === 'Failure') {
    return { status: 'Failure', data: null, error: emailResponse.error };
  } else {
    return { status: 'Success', data: emailResponse.data, error: null };
  }
}

export async function SendOutingJoinedEmail(
  outing_id: number,
  sender_profile: PrismaData
) {
  const outing = await GetOutingByOutingId(outing_id);
  if (outing.status === 'Failure') {
    return { status: 'Failure', data: null, error: outing.error };
  }

  const profilesInOuting = await GetAcceptedProfilesInOuting(outing_id);
  if (profilesInOuting.status === 'Failure') {
    return { status: 'Failure', data: null, error: profilesInOuting.error };
  }
  console.log('profiles in outing', profilesInOuting.data);

  const removedSelfProfiles = profilesInOuting.data.filter(
    (profile: Profile) => {
      if (profile.id !== sender_profile.data.id) {
        return true;
      } else {
        return false;
      }
    }
  );

  console.log(
    'removed self profiles',
    removedSelfProfiles,
    removedSelfProfiles.length
  );

  const names = removedSelfProfiles.map((profile: Profile) => profile.name);
  const accountsOfProfiles = removedSelfProfiles.map(
    async (profile: Profile) => await GetAccountByAccountId(profile.account_Id)
  );
  if (
    accountsOfProfiles.some((data: PrismaData) => data.status === 'Failure')
  ) {
    return {
      status: 'Failure',
      data: null,
      error: accountsOfProfiles.find(
        (data: PrismaData) => data.status === 'Failure'
      )?.error,
    };
  }
  const resolvedAccounts = await Promise.all(accountsOfProfiles);
  console.log('resolved accounts', resolvedAccounts, resolvedAccounts[0]);

  const accountEmails = resolvedAccounts.map(
    (account: PrismaData) => account.data.email
  );
  console.log('account emails', accountEmails);

  const emailData = {
    outing_id,
    outing_name: outing.data.name,
    start_date_and_time: outing.data.start_date_and_time,
    senderName: sender_profile.data.name,
    names,
  };

  const generatedEmail = GenerateOutingJoinedEmail(emailData);

  const emailResponse = await GenerateAndSend(generatedEmail, accountEmails);

  if (emailResponse.status === 'Failure') {
    return { status: 'Failure', data: null, error: emailResponse.error };
  } else {
    return { status: 'Success', data: emailResponse.data, error: null };
  }
}
