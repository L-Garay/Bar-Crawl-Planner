import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';
import dotenv from 'dotenv';
import { NotificationMachine } from '../../stateMachines/index';
import { interpret } from 'xstate';

dotenv.config();

// TODO need to add outing id to the notification so we can then fetch it and use it's name in the notification
export async function GenerateOutingNotification(
  addressee_id: number,
  sender_profile_id: number,
  outing_id: number
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
        outing_id,
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

export async function GenerateFriendRequest(
  addressee_profile_id: number,
  sender_profile_id: number
): Promise<PrismaData> {
  const created_at = new Date().toISOString();
  let notification: any;
  try {
    notification = await prismaClient.notification.create({
      data: {
        sender_profile_id,
        addressee_profile_id,
        type_code: 'FR',
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
        type_code: 'FR',
        notification_created_at: created_at,
        modified_at: created_at,
      },
    });
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
  return { status: 'Success', data: notification, error: null };
}

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

export async function TestMachine(
  notification_id: number,
  notificationStatus_id: number
): Promise<PrismaData> {
  try {
    const context = {
      notification_id,
      notificationStatus_id,
      notification: {},
    };
    const dynmaicMachine = NotificationMachine.withContext(context);
    const notificationService = interpret(dynmaicMachine).start('opened');
    console.log('BEFORE TRANSITION', notificationService.getSnapshot().value);
    notificationService.onTransition((state) => console.log(state.value));
    notificationService.send('ACCEPT');
    console.log('AFTER TRANSITION', notificationService.getSnapshot().value);
    return { status: 'Success', data: 'Success', error: null };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
