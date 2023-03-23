import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';
import dotenv from 'dotenv';
import { NotificationMachine } from '../../stateMachines/index';
import { interpret } from 'xstate';

dotenv.config();

// TODO need to add outing id to the notification so we can then fetch it and use it's name in the notification
// export async function GenerateOutingNotification(
//   addressee_id: number,
//   sender_profile_id: number,
//   outing_id: number
// ): Promise<PrismaData> {
//   // first create the notification
//   const created_at = new Date().toISOString(); // need to get this once, so both the notification and status have EXACT same timestamp
//   let notification: any;
//   try {
//     notification = await prismaClient.notification.create({
//       data: {
//         sender_profile_id,
//         addressee_profile_id: addressee_id,
//         type_code: 'OJ',
//         created_at,
//         outing_id,
//       },
//     });
//   } catch (error) {
//     return { status: 'Failure', data: null, error: error as PrismaError };
//   }

//   // then create the notification status
//   try {
//     await prismaClient.notificationStatus.create({
//       data: {
//         notification_id: notification.id,
//         modifier_profile_id: sender_profile_id,
//         status_code: 'S',
//         type_code: 'OJ',
//         notification_created_at: created_at,
//         modified_at: created_at,
//       },
//     });
//   } catch (error) {
//     return { status: 'Failure', data: null, error: error as PrismaError };
//   }
//   return { status: 'Success', data: notification, error: null };
// }

export async function GenerateOutingNotificationWithMachine(
  addressee_id: number,
  sender_profile_id: number,
  outing_id: number
): Promise<PrismaData> {
  try {
    const eventData = {
      sender_profile_id,
      addressee_profile_id: addressee_id,
      outing_id,
      type_code: 'OJ',
    };
    const notificationService = interpret(NotificationMachine).start();
    const state = notificationService.send('SEND', eventData);
    // NOTE do we .stop() the service here? and restart as needed?
    notificationService.stop();
    // TODO look into the state.context.notification and see if it's the same as the notification returned from the prisma call
    // based on return from friend request notification, it's not being set properly
    return { status: 'Success', data: state.context.notification, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

// export async function GenerateFriendRequest(
//   addressee_profile_id: number,
//   sender_profile_id: number
// ): Promise<PrismaData> {
//   const created_at = new Date().toISOString();
//   let notification: any;
//   try {
//     notification = await prismaClient.notification.create({
//       data: {
//         sender_profile_id,
//         addressee_profile_id,
//         type_code: 'FR',
//         created_at,
//       },
//     });
//   } catch (error) {
//     return { status: 'Failure', data: null, error: error as PrismaError };
//   }

//   try {
//     await prismaClient.notificationStatus.create({
//       data: {
//         notification_id: notification.id,
//         modifier_profile_id: sender_profile_id,
//         status_code: 'S',
//         type_code: 'FR',
//         notification_created_at: created_at,
//         modified_at: created_at,
//       },
//     });
//   } catch (error) {
//     return { status: 'Failure', data: null, error: error as PrismaError };
//   }
//   return { status: 'Success', data: notification, error: null };
// }

export async function GenerateFriendRequestWithMachine(
  addressee_profile_id: number,
  sender_profile_id: number
): Promise<PrismaData> {
  try {
    const created_at = new Date().toISOString();
    const eventData = {
      sender_profile_id,
      addressee_profile_id,
      type_code: 'FR',
      created_at,
    };
    const notificationService = interpret(NotificationMachine).start();
    const state = notificationService.send('SEND', eventData);
    notificationService.stop();
    // TODO look into the state.context.notification and see if it's the same as the notification returned from the prisma call
    // based on return from friend request notification, it's not being set properly
    return { status: 'Success', data: state.context.notification, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function GenerateFriendNotification(
  addressee_profile_id: number,
  sender_profile_id: number,
  type_code: string
): Promise<PrismaData> {
  const created_at = new Date().toISOString();
  let notification: any;
  try {
    notification = await prismaClient.notification.create({
      data: {
        sender_profile_id,
        addressee_profile_id,
        type_code,
        created_at,
      },
    });
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }

  try {
    await prismaClient.notificationStatus.create({
      data: {
        notification_id: notification.id,
        modifier_profile_id: sender_profile_id,
        status_code: 'S',
        type_code,
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

export async function OpenNotification(
  modifier_profile_id: number,
  type_code: string,
  notification_created_at: string,
  notification_id: number
): Promise<PrismaData> {
  try {
    const eventData = {
      modifier_profile_id,
      status_code: 'O',
      type_code,
      notification_created_at,
      modified_at: new Date().toISOString(),
      notification_id,
    };

    const notificationService = interpret(NotificationMachine).start('sent'); // since we know this method should only be called when a notification is sent and not opened
    const state = notificationService.send('OPEN', eventData);
    notificationService.stop();
    return { status: 'Success', data: state.context.notification, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}

export async function DeclineFriendRequest(
  modifier_profile_id: number,
  notification_id: number,
  notification_created_at: string
): Promise<PrismaData> {
  try {
    const eventData = {
      modifier_profile_id,
      notification_id,
      type_code: 'FR',
      status_code: 'D',
      notification_created_at,
      modified_at: new Date().toISOString(),
    };
    const notificationService = interpret(NotificationMachine).start('opened');
    const state = notificationService.send('DECLINE', eventData);
    notificationService.stop();
    return { status: 'Success', data: state.context.notification, error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
