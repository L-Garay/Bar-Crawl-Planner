import prismaClient from '../..';
import { PrismaData, PrismaError } from '../../types/sharedTypes';
import dotenv from 'dotenv';
import { NotificationMachine } from '../../stateMachines/index';
import { interpret } from 'xstate';

dotenv.config();

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

export async function AcceptFriendRequest(
  sender_profile_id: number,
  addressee_profile_id: number,
  notification_created_at: string,
  notification_id: number,
  modifier_profile_id: number
): Promise<PrismaData> {
  try {
    const eventData = {
      modifier_profile_id,
      sender_profile_id,
      addressee_profile_id,
      notification_created_at,
      notification_id,
      status_code: 'A', // used to update the notification status
      type_code: 'FR', // used to update the notification status
      // the creation of the FRR notification is handled by the machine and so needs no extra specific data
    };
    const notificationService = interpret(NotificationMachine).start('opened');
    const state = notificationService.send('ACCEPT_FRIEND', eventData);
    notificationService.stop();
    return {
      status: 'Success',
      data: state.context.notificationStatus,
      error: null,
    };
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
    const state = notificationService.send('DECLINE_FRIEND', eventData);
    notificationService.stop();
    return {
      status: 'Success',
      data: state.context.notificationStatus,
      error: null,
    };
  } catch (error) {
    return { status: 'Failure', data: null, error: error as PrismaError };
  }
}
