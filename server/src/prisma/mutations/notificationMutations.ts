import prismaClient from '../..';
import { PrismaError } from '../../types/sharedTypes';
import dotenv from 'dotenv';

dotenv.config();

export async function GenerateOutingNotification(
  recipient_id: number,
  sender_profile_id: number,
  sender_name: string,
  outing_name: string
) {
  // first create the notification status
  try {
    await prismaClient.notificationStatus.create({
      data: {
        status_code: 'S',
        created_at: new Date().toISOString(),
        sender_profile_id,
        recipient_profile_id: recipient_id,
        modifier_profile_id: sender_profile_id,
      },
    });
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }

  // then create the notification
  try {
    const notification = await prismaClient.notification.create({
      data: {
        sender_profile_id,
        recipient_profile_id: recipient_id,
        notification_type_code: 'Oi',
        notification_status_code: 'S',
        title: 'Outing Update',
        message: `${sender_name} has joined ${outing_name}!`,
        created_at: new Date().toISOString(),
      },
    });
    return { status: 'Success', data: notification, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
