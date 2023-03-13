import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';
import dotenv from 'dotenv';

dotenv.config();

// TODO need to add outing id to the notification so we can then fetch it and use it's name in the notification
export async function GenerateOutingNotification(
  addressee_id: number,
  sender_profile_id: number
): Promise<PrismaData> {
  // first create the notification
  const created_at = new Date().toISOString(); // need to get this once, so both the notification and status have EXACT same timestamp
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
        notification_id: notification.id,
        modifier_profile_id: sender_profile_id,
        status_code: 'S',
        type_code: 'OJ',
        notification_created_at: created_at,
        modified_at: created_at,
      },
    });
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
  return { status: 'Success', data: notification, error: null };
}

export async function GenerateNotificationStatus(
  modifier_profile_id: number,
  type_code: string,
  status_code: string,
  created_at: string,
  notification_id: number
): Promise<PrismaData> {
  try {
    const status = await prismaClient.notificationStatus.create({
      data: {
        modifier_profile_id,
        status_code,
        type_code,
        modified_at: new Date().toISOString(),
        notification_created_at: created_at, // need original notification created_at,
        notification_id, // need original notification id
      },
    });
    return { status: 'Success', data: status, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
