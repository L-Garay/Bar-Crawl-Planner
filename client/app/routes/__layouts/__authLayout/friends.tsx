import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getNewClient } from '~/apollo/getClient';
import { FriendListItem } from '~/components/friends/friendListItem';
import { GET_ALL_FRIENDSHIPS } from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';

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
  const { getAllFriendships } = friendships.data;
  console.log(getAllFriendships);

  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the friends page</h1>
        {getAllFriendships && getAllFriendships.length ? (
          <>
            {getAllFriendships.map((friendship: any) => {
              console.log(friendship.id);

              return <FriendListItem key={friendship.id} {...friendship} />;
            })}
          </>
        ) : (
          <p>No friends</p>
        )}

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
