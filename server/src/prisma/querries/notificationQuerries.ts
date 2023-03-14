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
            modified_at: true,
            modifier_profile_id: true,
          },
        },
        notification_addressee_relation: {
          select: {
            id: true,
            name: true,
            profile_img: true,
          },
        },
        notification_sender_relation: {
          select: {
            id: true,
            name: true,
            profile_img: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
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
    const notificationCount = await prismaClient.notification.findMany({
      where: {
        addressee_profile_id: user_id,
      },
      include: {
        notification_relation: true,
      },
    });
    // NOTE not a fan of this, would like to be able to use .count()
    // however, setting up the claueses and conditions is tricky when dealing with nested relations
    // also, the notfication statuses are not aware of each other, meaning that if two point to the same notification, there's no easy way to say "for all the statuses for this notification, count the ones that are 'S' but also not 'O'"
    let counter: number = 0;
    notificationCount.forEach((notification) => {
      const relation = notification.notification_relation;
      if (relation[relation.length - 1].status_code === 'S') counter++;
    });

    return { status: 'Success', data: counter, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
