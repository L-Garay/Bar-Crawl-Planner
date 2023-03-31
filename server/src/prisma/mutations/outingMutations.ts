import prismaClient from '../..';
import {
  GenerateOutingInviteEmailParams,
  OutingInput,
  OutingInviteProfiles,
  PrismaError,
  PrismaData,
  SendingOutingsInvitesInput,
  Email,
} from '../../types/sharedTypes';

import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import { Account, Profile } from '@prisma/client';
import dotenv from 'dotenv';
import short from 'short-uuid';
import { GetOutingByOutingId } from '../querries/outingsQuerries';
import { GetAccountByAccountId } from '../querries/accountQuerries';
import { GetAcceptedProfilesInOuting } from '../querries/profileQuerries';
import {
  GenerateOutingJoinedEmail,
  GenerateOutingInviteEmail,
} from '../../utilities/generateEmails';

dotenv.config();

export async function CreateOuting({
  name,
  created_at,
  start_date_and_time,
  place_ids,
  creator_profile_id,
}: OutingInput): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.create({
      data: {
        name,
        creator_profile_id: creator_profile_id,
        created_at,
        start_date_and_time,
        place_ids,
        accepted_profiles: {
          connect: { id: creator_profile_id },
        },
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function UpdateOuting(
  outingId: number,
  name?: string,
  start_date_and_time?: string
): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.update({
      where: {
        id: outingId,
      },
      data: {
        name,
        start_date_and_time,
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function DeleteOuting(outingId: number) {
  try {
    await prismaClient.outing.delete({
      where: {
        id: outingId,
      },
    });
    return {
      status: 'Success',
      data: 'Successfully deleted outing',
      error: null,
    };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function ConnectUserWithOuting(
  outingId: number,
  profileId: number
): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.update({
      where: { id: outingId },
      data: {
        pending_profiles: {
          disconnect: { id: profileId },
        },
        accepted_profiles: {
          connect: {
            id: profileId,
          },
        },
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    console.log(error);
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function DisconnectUserWithOuting(
  profileId: number,
  outingId: number
): Promise<PrismaData> {
  try {
    const user = await prismaClient.outing.update({
      where: { id: outingId },
      data: {
        accepted_profiles: {
          disconnect: { id: profileId },
        },
        pending_profiles: {
          disconnect: { id: profileId },
        },
        declined_profiles: {
          connect: { id: profileId },
        },
      },
    });
    return { status: 'Success', data: user, error: null };
  } catch (error) {
    console.log(error);
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function SendOutingInvites({
  outing_id,
  start_date_and_time,
  emails,
  senderName,
}: SendingOutingsInvitesInput): Promise<PrismaData> {
  if (!emails || emails.length === 0) {
    console.log('No emails provided');

    return {
      status: 'Success',
      data: 'No emails provided or emails already accepted',
      error: null,
    };
  }
  // instantiate mailgen generator to create emails
  const generator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Bar Crawl Planner',
      link: 'http://localhost:3000/homepage',
    },
  });
  // create nodemailer gmail transporter to send emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

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
  // get the accounts associated with the input emails
  const accounts: Promise<Account | null>[] = emails.map(async (email) => {
    const account = await prismaClient.account.findFirst({
      where: {
        email: email,
      },
    });
    return account;
  });
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
        const newAccount: Account = await prismaClient.account.create({
          data: {
            email: emails[index],
            created_at: new Date().toISOString(),
          },
        });
        return newAccount;
      }
    }
  );
  const resolvedCreatedAccounts = await Promise.allSettled(createdAccounts);

  // get the profiles associated with the accounts
  // if the profile is already connected to the outing (accepted), don't include it
  // if a profile doesn't exist, create one
  const profiles: Promise<Profile | null>[] = resolvedCreatedAccounts.map(
    async (account) => {
      if (account.status === 'rejected') return null;
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
              social_pin: short.generate(),
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
    .filter((profile) => profile !== null)
    .map((profile) => {
      return {
        id: profile?.id,
        name: profile?.name,
        social_pin: profile?.social_pin,
      } as OutingInviteProfiles;
    });

  // connect the profiles to the outing
  resolvedProfiles.map(async (profile) => {
    await prismaClient.outing.update({
      where: {
        id: outing_id,
      },
      data: {
        pending_profiles: {
          connect: {
            id: profile.id,
          },
        },
      },
    });
  });

  const outing = await GetOutingByOutingId(outing_id);
  if (outing.status === 'Failure') {
    return { status: 'Failure', data: null, error: outing.error };
  }

  // generate the email inputs to be used in constructing the email
  const generateEmailInput: GenerateOutingInviteEmailParams = {
    outing_name: outing.data.name,
    outing_id,
    start_date_and_time,
    profiles: resolvedProfiles,
    senderName,
  };
  // generate the email templates
  const generatedEmails = GenerateOutingInviteEmail(generateEmailInput);
  // generate the html emails using mailgen generator
  const emailsToSend = generatedEmails.map((email: Email) =>
    generator.generate(email)
  );
  // const textEmailsToSend = generatedEmails.map((email) => generator.generatePlaintext(email));

  // set the mail options for each email
  const mailOptions = emailsToSend.map((email: Email, index: number) => {
    return {
      from: process.env.GMAIL_EMAIL,
      to: emails[index],
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
}

export async function SendOutingJoinedEmail(
  outing_id: number,
  sender_profile: PrismaData
) {
  // instantiate mailgen generator to create emails
  const generator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Bar Crawl Planner',
      link: 'http://localhost:3000/homepage',
    },
  });
  // create nodemailer gmail transporter to send emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

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
  const emailsToSend = generatedEmail.map((email) => generator.generate(email));
  console.log('emails to send', emailsToSend.length);

  const mailOptions = emailsToSend.map((email: Email, index: number) => {
    return {
      from: process.env.GMAIL_EMAIL,
      to: accountEmails[index],
      subject: 'Bar Crawl Invite',
      html: email,
    };
  });
  const emailResponse = await Promise.allSettled(
    mailOptions.map((mailOption: Record<string, any>) =>
      transporter.sendMail(mailOption)
    )
  );
  emailResponse.forEach((response: any, index: number) => {
    if (response.status === 'rejected') {
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
}
