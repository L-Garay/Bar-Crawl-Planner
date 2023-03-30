import { Profile } from '@prisma/client';
import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';
import GenerateFriendRequestEmail from '../../utilities/generateEmails/generateFriendRequest';

export async function AddFriend(
  sender_profile_id: number,
  addressee_profile_id: number
): Promise<PrismaData> {
  console.log('sender_profile_id: ', sender_profile_id);
  console.log('addressee_profile_id: ', addressee_profile_id);

  try {
    const time = new Date().toISOString();
    const friend = await prismaClient.friendship.create({
      data: {
        created_at: time,
        modified_at: time,
        requestor_profile_id: sender_profile_id,
        addressee_profile_id,
        last_modified_by: sender_profile_id,
        status_code: 'R',
      },
    });
    return { status: 'Success', data: friend, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function UpdateFriend(
  friendship_id: number,
  addressee_profile_id: number,
  status_code: string
): Promise<PrismaData> {
  try {
    const updatedFriend = await prismaClient.friendship.update({
      where: {
        id: friendship_id,
      },
      data: {
        modified_at: new Date().toISOString(),
        last_modified_by: addressee_profile_id,
        status_code,
      },
    });
    return { status: 'Success', data: updatedFriend, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function SendFriendRequestEmail(
  sender_profile: Profile,
  addressee_profile: Profile
): Promise<PrismaData> {
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

  const addresseeAccount = await prismaClient.account.findUnique({
    where: {
      id: addressee_profile.account_Id,
    },
  });

  if (!addresseeAccount) {
    return {
      status: 'Failure',
      data: null,
      error: {
        name: 'No account',
        message: 'Unable to find account to send request to',
      },
    };
  }

  const generatedEmail = GenerateFriendRequestEmail(
    sender_profile.name,
    addressee_profile.name
  );
  const emailToSend = generator.generate(generatedEmail);
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: addresseeAccount.email,
    subject: 'Bar Crawl Friend Request',
    html: emailToSend,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      status: 'Success',
      data: 'Successfully sent friend request',
      error: null,
    };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GenerateFriendRequestAndEmail(
  addressee_profile_id: number,
  sender_profile_id: number
): Promise<PrismaData> {
  const addedFriend = await AddFriend(sender_profile_id, addressee_profile_id);

  if (addedFriend.status === 'Failure') {
    return { status: 'Failure', data: null, error: addedFriend.error };
  }

  const addresseeProfile = await prismaClient.profile.findUnique({
    where: {
      id: addressee_profile_id,
    },
  });
  const senderProfile = await prismaClient.profile.findUnique({
    where: {
      id: sender_profile_id,
    },
  });

  if (!addresseeProfile || !senderProfile) {
    return {
      status: 'Failure',
      data: null,
      error: {
        name: 'No accounts',
        message: 'Unable to find account to send request',
      },
    };
  }

  const emailStatus = await SendFriendRequestEmail(
    senderProfile,
    addresseeProfile
  );

  return emailStatus;
}
