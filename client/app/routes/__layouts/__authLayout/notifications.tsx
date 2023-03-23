import type { LinksFunction } from '@remix-run/node';
import { NotificationCard } from '~/components/notifications/notificationCard';
import notificationStyles from '~/generatedStyles/notifications.css';
import { useMemo, useState } from 'react';
import { NotificationDetails } from '~/components/notifications/notificationDetails';
import {
  GENERATE_NOTIFICATION_STATUS,
  GET_NEW_NOTIFICATIONS_COUNT,
  GET_NOTIFICATIONS,
  OPEN_NOTIFICATION,
} from '~/constants/graphqlConstants';
import { useMutation, useQuery } from '@apollo/client';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: notificationStyles,
      as: 'style',
    },
  ];
};

export default function Notifications() {
  const [notificationIndex, setnotificationIndex] = useState<number>();

  const {
    data: notificationsData,
    loading: notificationsLoading,
    error: notificationsError,
  } = useQuery(GET_NOTIFICATIONS);

  const [openNotification, { error: statusError }] = useMutation(
    OPEN_NOTIFICATION,
    {
      refetchQueries: [
        { query: GET_NOTIFICATIONS },
        { query: GET_NEW_NOTIFICATIONS_COUNT },
      ],
      awaitRefetchQueries: true,
    }
  );

  const notifications = useMemo(() => {
    if (!notificationsData || !notificationsData.getAllNotifications) return [];
    return notificationsData.getAllNotifications;
  }, [notificationsData]);

  const notification = useMemo(() => {
    if (notifications && notificationIndex !== undefined) {
      return notifications[notificationIndex];
    }
  }, [notificationIndex, notifications]);

  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the Notifications page</h1>
        <div style={{ display: 'flex' }}>
          <div className="notifications-list">
            {notifications && notifications.length ? (
              <>
                {notifications.map((notification: any, index: number) => {
                  return (
                    <NotificationCard
                      key={notification.created_at}
                      {...notification}
                      setnotificationIndex={setnotificationIndex}
                      index={index}
                      selectedNotification={notifications[notificationIndex!]}
                      openNotification={openNotification}
                    />
                  );
                })}
              </>
            ) : (
              <p>Nothing yet</p>
            )}
          </div>
          {notification ? (
            <NotificationDetails
              {...notification}
              // generateNotificationStatus={generateNotificationStatus}
            />
          ) : null}
        </div>

        <p>
          this will be pretty simple page, thinking that we just have an 'inbox'
          style list of notifications
        </p>
        <p>
          with different sections for new/unopened ones and for read/opened ones
        </p>
        <p>
          should be relatively easy, you can make a reusable component and pass
          in the dynamic data as props
        </p>
        <p>
          different types of notifications can have different components (i.e.
          the outing notifications don't need any interactivity other than
          deleting, whereas the friends notifications will require user
          interaction)
        </p>
      </div>
    </>
  );
}
