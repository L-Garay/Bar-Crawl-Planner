import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';

export async function GetAllNotifications(
  user_id: number
): Promise<PrismaData> {
  try {
    const notifications = await prismaClient.notification.findMany({
      where: {
        addressee_profile_id: user_id,
      },
      include: {
        notification_relation: {
          select: {
            status_code: true,
            created_at: true,
            modifier_profile_id: true,
          },
        },
        notification_addressee_relation: {
          select: {
            name: true,
            profile_img: true,
          },
        },
        notification_sender_relation: {
          select: {
            name: true,
            profile_img: true,
          },
        },
      },
    });
    console.log('notifications: ', notifications);

    return { status: 'Success', data: notifications, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GetNewNotificationCount(
  user_id: number
): Promise<PrismaData> {
  try {
    const notificationCount = await prismaClient.notification.count({
      where: {
        AND: [
          {
            addressee_profile_id: user_id,
          },
          {
            notification_relation: {
              some: {
                status_code: 'S', // we want 'S' (sent) and not 'O' (opened)
              },
            },
          },
        ],
      },
    });
    return { status: 'Success', data: notificationCount, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
