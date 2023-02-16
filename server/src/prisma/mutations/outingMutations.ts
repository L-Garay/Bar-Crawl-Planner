import { prismaClient } from '../..';
import {
  OutingInput,
  QueryData,
  SendingOutingsInvitesInput,
} from '../../types/sharedTypes';
import { GetPrismaError } from '../../utilities';
import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import { Account, Profile } from '@prisma/client';
import { GenerateOutingInviteEmail } from '../../utilities/generateEmails';
import dotenv from 'dotenv';

dotenv.config();

export async function CreateOuting({
  name,
  created_at,
  start_date_and_time,
  place_ids,
  creatorId,
}: OutingInput & { creatorId: number }): Promise<QueryData> {
  try {
    const outing = await prismaClient.outing.create({
      data: {
        name,
        creator_profile_id: creatorId,
        created_at,
        start_date_and_time,
        place_ids,
        profiles: {
          connect: { id: creatorId },
        },
      },
    });
    return { status: 'Success', data: outing };
  } catch (error) {
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}

export async function SendOutingInvites({
  outing_id,
  start_date_and_time,
  emails,
  senderName,
}: SendingOutingsInvitesInput): Promise<QueryData> {
  try {
    const generator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Bar Crawl Planner',
        link: 'http://localhost:3000/homepage',
      },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const accounts: Promise<Account | null>[] = emails.map(async (email) => {
      const account = await prismaClient.account.findFirst({
        where: {
          email: email,
        },
      });
      return Promise.resolve(account);
    });
    const resolvedAccounts = (await Promise.all(accounts)).filter(
      (account) => account !== null
    );
    console.log('\n\nRESOLVED ACCOUNTS', resolvedAccounts);

    const profiles: Promise<Profile | null>[] = resolvedAccounts.map(
      async (account) => {
        if (account) {
          const profile = await prismaClient.profile.findFirst({
            where: {
              account_Id: account.id,
            },
          });
          return Promise.resolve(profile);
        } else {
          return Promise.resolve(null);
        }
      }
    );
    const resolvedProfiles = (await Promise.all(profiles))
      .filter((profile) => profile !== null)
      .map((profile) => {
        return {
          id: profile?.id,
          name: profile?.name,
        };
      });
    console.log('\n\nRESOLVED PROFILES', resolvedProfiles);

    const generatedEmails = GenerateOutingInviteEmail(
      outing_id,
      start_date_and_time,
      resolvedProfiles,
      senderName
    );
    const emailsToSend = generatedEmails.map((email) =>
      generator.generate(email)
    );
    // const textEmailsToSend = generatedEmails.map((email) => generator.generatePlaintext(email));

    const mailOptions = emailsToSend.map((email, index) => {
      return {
        from: process.env.GMAIL_EMAIL,
        to: emails[index],
        subject: 'Bar Crawl Invite',
        html: email,
      };
    });

    const emailResponse = await Promise.allSettled(
      mailOptions.map((mailOption) => transporter.sendMail(mailOption))
    );
    console.log('\n\nEMAIL RESPONSE', emailResponse);

    emailResponse.forEach((response, index, array) => {
      if (response.status === 'rejected') {
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
    };
  } catch (error) {
    console.error(error);
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}

export async function ConnectUserWithOuting(
  outingId: number,
  profileId: number
): Promise<QueryData> {
  try {
    console.log('DOES THE ACTUAL FUNCTION RUN?', outingId, profileId);

    const outing = await prismaClient.outing.update({
      where: { id: outingId },
      data: {
        profiles: {
          connect: {
            id: profileId,
          },
        },
      },
    });
    return { status: 'Success', data: outing };
  } catch (error) {
    console.log(error);
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}

export async function DisconnectUserWithOuting(
  profileId: number,
  outingId: number
): Promise<QueryData> {
  try {
    const user = await prismaClient.outing.update({
      where: { id: outingId },
      data: {
        profiles: {
          disconnect: { id: profileId },
        },
      },
    });
    return { status: 'Success', data: user };
  } catch (error) {
    console.log(error);
    const newError = GetPrismaError(error);
    return { status: 'Failure', data: null, error: newError };
  }
}
