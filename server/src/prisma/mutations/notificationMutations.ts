import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';
import dotenv from 'dotenv';

dotenv.config();

export async function GenerateOutingNotification(
  addressee_id: number,
  sender_profile_id: number
): Promise<PrismaData> {
  // first create the notification
  const created_at = new Date().toISOString();
  let notification: any;
  try {
    notification = await prismaClient.notification.create({
      data: {
        sender_profile_id,
        addressee_profile_id: addressee_id,
        type_code: 'OJ',
        created_at,
      },
    });
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
  // then create the notification status
  try {
    await prismaClient.notificationStatus.create({
      data: {
        sender_profile_id,
        addressee_profile_id: addressee_id,
        modifier_profile_id: sender_profile_id,
        status_code: 'S',
        type_code: 'OJ',
        created_at,
      },
    });
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
  return { status: 'Success', data: notification, error: null };
}
