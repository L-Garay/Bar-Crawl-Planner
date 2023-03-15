import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getNewClient } from '~/apollo/getClient';
import { FriendListItem } from '~/components/friends/friendListItem';
import { GET_ALL_FRIENDSHIPS } from '~/constants/graphqlConstants';
import { useNotificationContext } from '~/contexts/notificationContext';
import logApolloError from '~/utils/getApolloError';
import friendsStyles from '~/generatedStyles/friends.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: friendsStyles,
      as: 'style',
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const client = await getNewClient(request);
  let friendships: any;
  try {
    friendships = await client.query({
      query: GET_ALL_FRIENDSHIPS,
    });
  } catch (error) {
    logApolloError(error);
    throw new Response(JSON.stringify(error), { status: 500 });
  }

  return { friendships };
};

export default function FriendsIndex() {
  const { friendships } = useLoaderData();
  const { sentFriendRequests, receivedFriendRequests } =
    useNotificationContext();
  const { getAllFriendships } = friendships.data;
  console.log('all friends', getAllFriendships); // these are friendships, not users
  console.log('sent requests', sentFriendRequests); // these are notifications, not friendships or users
  console.log('recieved requests', receivedFriendRequests); // these are notifications, not friendships or users

  // TODO I'm not sure how much detail and what kind I want to display in these lists
  // but if we need profile information, we can easily get it from the friendship relations
  // however, if we need to get profile information from the notifications, we will need to make a separate query using the profile_ids stored on the notifications

  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the friends page</h1>
        <div className="friends-lists">
          <div className="friend-requests list">
            <h5>Your friend requests</h5>
            <div>
              <ul>
                {/* we need to get the friend's profile data to display here */}
              </ul>
            </div>
          </div>
          <div className="friends list">
            <h5>Your friends</h5>
            <div>
              <ul>
                {/* we need to get the friend's profile data to display here */}
              </ul>
            </div>
          </div>
          <div className="sent-requests list">
            <h5>Pending Requests</h5>
            <div>
              <ul>
                {/* we need to get the friend's profile data to display here */}
              </ul>
            </div>
          </div>
        </div>

        <p>I'm not entirely sure how I want this page to look</p>
        <p>
          I think one option of UI should be just a list of friend information
          (for ease of searching)
        </p>
        <p>And then there should be a more interactive/cool display/list</p>
        <p>However, how those two look/work I'm not sure</p>
        <p>
          There will also need to be tab/section to be able to search/add
          friends
        </p>
        <b>
          Which brings me to something I'd like to implement regarding
          friends/profiles. I'd like to be able to add friends either by phone
          number, or by a randomly generated and assigned PIN of some sort.
        </b>
        <small>
          The PIN will be generated and assigned upon profile creation
        </small>
      </div>
    </>
  );
}
