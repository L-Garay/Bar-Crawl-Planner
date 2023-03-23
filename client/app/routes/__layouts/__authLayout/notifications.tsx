import type { LinksFunction } from '@remix-run/node';
import { NotificationCard } from '~/components/notifications/notificationCard';
import notificationStyles from '~/generatedStyles/notifications.css';
import { useMemo, useState } from 'react';
import { NotificationDetails } from '~/components/notifications/notificationDetails';
import { GET_NOTIFICATIONS } from '~/constants/graphqlConstants';
import { useQuery } from '@apollo/client';

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

  const { data: notificationsData } = useQuery(GET_NOTIFICATIONS);

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
                    />
                  );
                })}
              </>
            ) : (
              <p>Nothing yet</p>
            )}
          </div>
          {notification ? <NotificationDetails {...notification} /> : null}
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
