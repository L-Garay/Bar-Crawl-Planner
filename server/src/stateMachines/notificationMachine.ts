import { assign, createMachine, interpret } from 'xstate';
import prismaClient from '..';

// can start the machine when the user hits the /authenticate route (if they are properly authenticated)
// at that point we know we they are a registered user who can start using the machine
// we'll need to implement a way for the front end to signal to the server that the user has logged out (currently logging out is all client side)
// at that point we can stop the machine, since we'll know they are no longer a registered user

// each time a user selects a nofitication, we need to make sure to put it into context so we can derive what stae it's in

// when a user takes any action with regards to a notification, we will need to set that notification and it's corresponding most relevant status, into the machine context using .withContext() and passing in the data
// then at that point, we will be able to access the notitication and status in the functions used for the guarded transitions
// the guards will be used to determine the current state of the notification and then determine what the next state should be

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
    },
    states: {
      created: {
        on: {
          SEND: {
            target: 'sent',
            actions: 'generateNotification',
          }, // transition to sent state
        },
      },
      sent: {
        entry: [],
        on: {
          OPEN: {
            target: 'opened',
            actions: 'generateNotificationStatus',
          }, // transition to opened state
          DELETE: {
            target: 'deleted',
            // actions: 'generateNotificationStatus',
          }, // transition to deleted state
        },
      },
      opened: {
        entry: [],
        on: {
          ACCEPT: {
            target: 'accepted',
            // actions: ['generateNotificationStatus'],
          }, // transition to accepted state
          DECLINE: {
            target: 'declined',
            // actions: 'generateNotificationStatus',
          }, // transition to declined state
          DELETE: {
            target: 'deleted',
            // actions: 'generateNotificationStatus',
          }, // transition to deleted state
        },
      },
      accepted: {
        entry: [],
        on: {
          DELETE: {
            target: 'deleted',
            // actions: 'generateNotificationStatus',
          }, // transition to deleted state
        },
      },
      declined: {
        entry: [],
        on: {
          DELETE: {
            target: 'deleted',
            // actions: 'generateNotificationStatus',
          }, // transition to deleted state
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
        // use context and event to generate either outingNotification or friendNotification and respective status
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
      generateNotificationStatus: async (context, event) => {
        // use context and event to create a new notification status for a given notification
        const {
          modifier_profile_id,
          status_code,
          type_code,
          created_at,
          notification_id,
        } = event;
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
        assign({
          notificationStatus_id: status.id,
          notification_id,
        });
        console.log('GENERATE NOTIFICATION STATUS', context, event);
      },
      deleteNotification: (context, event) => {
        // use context and event to update notification status to deleted
        console.log('DELETE NOFITICATION', context, event);
      },
    },
  }
);

export default notificationMachine;
