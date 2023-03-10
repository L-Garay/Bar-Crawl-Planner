import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getNewClient } from '~/apollo/getClient';
import { OutingNotification } from '~/components/notifications/notificationCard';
import { GET_NOTIFICATIONS } from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';
import notificationStyles from '~/generatedStyles/notifications.css';
import { useMemo, useState } from 'react';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: notificationStyles,
      as: 'style',
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const client = await getNewClient(request);
  try {
    const notifications = await client.query({
      query: GET_NOTIFICATIONS,
    });
    return { notifications };
  } catch (error) {
    logApolloError(error);
    throw new Response(JSON.stringify(error), { status: 500 });
  }
};

export default function Notifications() {
  const { notifications } = useLoaderData();
  const { getAllNotifications } = notifications.data;
  const [notificationIndex, setnotificationIndex] = useState<number>();

  const notification = useMemo(() => {
    if (notificationIndex !== undefined) {
      return getAllNotifications[notificationIndex];
    }
  }, [notificationIndex, getAllNotifications]);

  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the Notifications page</h1>
        {getAllNotifications.map((notification: any, index: number) => {
          return (
            <OutingNotification
              key={notification.created_at}
              {...notification}
              setnotificationIndex={setnotificationIndex}
              index={index}
            />
          );
        })}
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
