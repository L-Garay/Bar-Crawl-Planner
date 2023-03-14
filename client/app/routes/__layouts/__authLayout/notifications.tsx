import type { LinksFunction } from '@remix-run/node';
import { OutingNotification } from '~/components/notifications/notificationCard';
import notificationStyles from '~/generatedStyles/notifications.css';
import { useMemo, useState } from 'react';
import { useNotificationContext } from '~/contexts/notificationContext';

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
  const { notifications } = useNotificationContext();
  const [notificationIndex, setnotificationIndex] = useState<number>();

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
                    <OutingNotification
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
          <div className="main-notification-container">
            <h5>this will be the selected nofitication</h5>
            {notification ? (
              <>
                <p> {notification.created_at}</p>
                <p> {notification.type_code}</p>
                <p> {notification.notification_sender_relation.name}</p>
              </>
            ) : null}
          </div>
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
