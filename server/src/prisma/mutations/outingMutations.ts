import prismaClient from '../..';
import {
  GenerateOutingInviteEmailParams,
  OutingInput,
  OutingInviteProfiles,
  PrismaError,
  PrismaData,
  SendingOutingsInvitesInput,
} from '../../types/sharedTypes';

import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import { Account, Profile } from '@prisma/client';
import { GenerateOutingInviteEmail } from '../../utilities/generateEmails/';
import dotenv from 'dotenv';
import short from 'short-uuid';

dotenv.config();

export async function CreateOuting({
  name,
  created_at,
  start_date_and_time,
  place_ids,
  creatorId,
}: OutingInput & { creatorId: number }): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.create({
      data: {
        name,
        creator_profile_id: creatorId,
        created_at,
        start_date_and_time,
        place_ids,
        accepted_profiles: {
          connect: { id: creatorId },
        },
      },
    });
    return { status: 'Success', data: outing, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function SendOutingInvites({
  outing_id,
  start_date_and_time,
  emails,
  senderName,
}: SendingOutingsInvitesInput): Promise<PrismaData> {
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
    return Promise.resolve(account);
  });
  const resolvedAccounts = await Promise.allSettled(accounts);

  // if an account doesn't exist, create one
  const createdAccounts: Promise<Account | null>[] = resolvedAccounts.map(
    async (account, index) => {
      if (account.status === 'rejected') return Promise.resolve(null);
      if (account.status === 'fulfilled' && account.value) {
        // if there is a valid account, return it
        return Promise.resolve(account.value);
      } else {
        // otherwise, create a new account
        const newAccount: Account = await prismaClient.account.create({
          data: {
            email: emails[index],
            created_at: new Date().toISOString(),
          },
        });
        return Promise.resolve(newAccount);
      }
    }
  );
  const resolvedCreatedAccounts = await Promise.allSettled(createdAccounts);
  console.log('\n\nRESOLVED ACCOUNTS', resolvedAccounts);
  console.log('\n\nCREATED ACCOUNTS', createdAccounts);

  // get the profiles associated with the accounts
  // if a profile doesn't exist, create one
  const profiles: Promise<Profile | null>[] = resolvedCreatedAccounts.map(
    async (account) => {
      if (account.status === 'rejected') return Promise.resolve(null);
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
          return Promise.resolve(newProfile);
        }
        return Promise.resolve(profile);
      } else {
        return Promise.resolve(null);
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
  console.log('\n\nRESOLVED PROFILES', resolvedProfiles);

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

  // generate the email inputs to be used in constructing the email
  const generateEmailInput: GenerateOutingInviteEmailParams = {
    outing_id,
    start_date_and_time,
    profiles: resolvedProfiles,
    senderName,
  };
  // generate the email templates
  const generatedEmails = GenerateOutingInviteEmail(generateEmailInput);
  // generate the html emails using mailgen generator
  const emailsToSend = generatedEmails.map((email) =>
    generator.generate(email)
  );
  // const textEmailsToSend = generatedEmails.map((email) => generator.generatePlaintext(email));

  // set the mail options for each email
  const mailOptions = emailsToSend.map((email, index) => {
    return {
      from: process.env.GMAIL_EMAIL,
      to: emails[index],
      subject: 'Bar Crawl Invite',
      html: email,
    };
  });

  // use nodemailer transport to send the emails
  const emailResponse = await Promise.allSettled(
    mailOptions.map((mailOption) => transporter.sendMail(mailOption))
  );
  console.log('\n\nEMAIL RESPONSE', emailResponse);

  // log failed emails
  emailResponse.forEach((response, index, array) => {
    if (response.status === 'rejected') {
      // TODO log to some loggin service
      console.log(`Email in array: ${array[index]}\n` + response.reason);
    }
  });
  const successfulEmails = emailResponse.filter(
    (response) => response.status === 'fulfilled'
  );
  const successString = successfulEmails.length > 1 ? 's' : '';
  return {
    status: 'Success',
    data: `Sucessfully sent ${successfulEmails.length} email${successString}!`,
    error: null,
  };
}

export async function ConnectUserWithOuting(
  outingId: number,
  profileId: number
): Promise<PrismaData> {
  try {
    const outing = await prismaClient.outing.update({
      where: { id: outingId },
      data: {
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
