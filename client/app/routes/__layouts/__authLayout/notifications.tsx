import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getNewClient } from '~/apollo/getClient';
import { FriendListItem } from '~/components/friends/friendListItem';
import { GET_NOTIFICATIONS } from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';

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
  console.log(getAllNotifications);

  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the Notifications page</h1>
        {getAllNotifications.map((notification: any) => {
          return (
            <div key={notification.created_at} style={{ display: 'flex' }}>
              <p style={{ paddingRight: 10 }}>
                Sender: {notification.sender_profile_id}
              </p>
              <p style={{ paddingRight: 10 }}>Type: {notification.type_code}</p>
              <p>Status: {notification.notification_relation[0].status_code}</p>
            </div>
          );
        })}
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
