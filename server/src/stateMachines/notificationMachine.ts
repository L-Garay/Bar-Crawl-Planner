import { assign, createMachine } from 'xstate';
import prismaClient from '..';
import { AddFriend } from '../prisma/mutations/friendsMutations';

// can start the machine when the user hits the /authenticate route (if they are properly authenticated)
// at that point we know we they are a registered user who can start using the machine
// we'll need to implement a way for the front end to signal to the server that the user has logged out (currently logging out is all client side)
// at that point we can stop the machine, since we'll know they are no longer a registered user

// each time a user selects a nofitication, we need to make sure to put it into context so we can derive what stae it's in

// However, I just saw that you can start the machine in a specific state by passing in the state to the interpretor's .start() method
// this will allow us to pick up a notification that may already be in an intermediate state, lilke opened or accepted, without having to have an extra 'unkown' state with logic to determine what state the notification is in and where to go next

const notificationMachine = createMachine(
  {
    id: 'notifications',
    initial: 'created',
    predictableActionArguments: true,
    context: {
      notification_id: 0,
      notificationStatus_id: 0,
      notification: {} as any,
      notificationStatus: {} as any,
    },
    states: {
      created: {
        on: {
          SEND: {
            target: 'sent',
            actions: 'generateNotification',
          },
        },
      },
      sent: {
        entry: [],
        on: {
          OPEN: {
            target: 'opened',
            actions: 'generateNotificationStatus',
          },
          DELETE: {
            target: 'deleted',
            // actions: 'generateNotificationStatus',
          },
        },
      },
      opened: {
        entry: [],
        on: {
          ACCEPT_FRIEND: {
            target: 'accepted',
            actions: [
              'addFriend', // add users as friends in friends table
              'generateNotificationStatus', // update original friend request notitication status to 'A'
              'generateFriendRequestResponseNotification', // create new friend request response notification to be sent to the friend request initiator
            ],
          },
          DECLINE_FRIEND: {
            target: 'declined',
            actions: 'generateNotificationStatus',
          },
          DELETE: {
            target: 'deleted',
            // actions: 'generateNotificationStatus',
          },
        },
      },
      accepted: {
        entry: [],
        on: {
          DELETE: {
            target: 'deleted',
            // actions: 'generateNotificationStatus',
          },
        },
      },
      declined: {
        entry: [],
        on: {
          DELETE: {
            target: 'deleted',
            // actions: 'generateNotificationStatus',
          },
        },
      },
      deleted: {
        type: 'final',
        onDone: {
          actions: 'deleteNotification',
        },
      },
    },
  },
  {
    actions: {
      generateNotification: async (context, event) => {
        console.log('GENERATE NOTIFICATION', context, event);
        const created_at = new Date().toISOString();
        const {
          sender_profile_id,
          addressee_profile_id,
          type_code,
          outing_id,
        } = event;
        const notification = await prismaClient.notification.create({
          data: {
            sender_profile_id,
            addressee_profile_id,
            type_code,
            created_at,
            outing_id,
            notification_relation: {
              create: {
                modifier_profile_id: sender_profile_id,
                status_code: 'S', // since we KNOW the notificaiton is being transition to the 'Sent' state
                type_code, // since the type_code comes from the event, we can just pass it in and whether it's an outing or friend notification, it will be set properly
                notification_created_at: created_at,
                modified_at: created_at,
              },
            },
          },
        });
        assign({
          notification_id: notification.id,
          notification: notification,
        });
      },
      generateFriendRequestResponseNotification: async (context, event) => {
        const created_at = new Date().toISOString();
        const { sender_profile_id, addressee_profile_id, outing_id } = event;
        const notification = await prismaClient.notification.create({
          data: {
            sender_profile_id: addressee_profile_id, // since these values come from the original friend request notification, we need to reverse them
            addressee_profile_id: sender_profile_id,
            type_code: 'FRR',
            created_at,
            outing_id,
            notification_relation: {
              create: {
                modifier_profile_id: addressee_profile_id,
                status_code: 'S', // since we KNOW the notificaiton is being transition to the 'Sent' state
                type_code: 'FRR',
                notification_created_at: created_at,
                modified_at: created_at,
              },
            },
          },
        });
        assign({
          notification_id: notification.id,
          notification: notification,
        });
      },
      generateNotificationStatus: async (context, event) => {
        const {
          modifier_profile_id,
          status_code,
          type_code,
          notification_created_at,
          notification_id,
        } = event;
        const status = await prismaClient.notificationStatus.create({
          data: {
            modifier_profile_id,
            status_code,
            type_code,
            modified_at: new Date().toISOString(),
            notification_created_at, // need original notification created_at,
            notification_id, // need original notification id
          },
        });
        assign({
          notificationStatus_id: status.id,
          notification_id,
          notificationStatus: status,
        });
        console.log('GENERATE NOTIFICATION STATUS', context, event);
      },
      addFriend: async (context, event) => {
        const { sender_profile_id, addressee_profile_id } = event;
        await AddFriend(sender_profile_id, addressee_profile_id);
      },
      deleteNotification: (context, event) => {
        // use context and event to update notification status to deleted
        console.log('DELETE NOFITICATION', context, event);
      },
    },
  }
);

export default notificationMachine;
