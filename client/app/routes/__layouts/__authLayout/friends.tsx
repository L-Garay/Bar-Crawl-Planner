import type { LinksFunction } from '@remix-run/node';
import {
  GET_ALL_FRIENDSHIPS,
  GET_FRIEND_REQUESTS,
  GET_SENT_FRIEND_REQUESTS,
} from '~/constants/graphqlConstants';
import friendsStyles from '~/generatedStyles/friends.css';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: friendsStyles,
      as: 'style',
    },
  ];
};

export default function FriendsIndex() {
  const { data: friendsData, error: friendsError } =
    useQuery(GET_ALL_FRIENDSHIPS);
  const { data: sentData, error: sentError } = useQuery(
    GET_SENT_FRIEND_REQUESTS
  );

  const { data: recievedData, error: recievedError } =
    useQuery(GET_FRIEND_REQUESTS);

  const friends = useMemo(() => {
    // NOTE these are friendships, not profiles or notifications
    if (!friendsData || !friendsData.getAllFriendships) return [];
    return friendsData.getAllFriendships;
  }, [friendsData]);

  const sentRequests = useMemo(() => {
    // NOTE these are notifications, not friendships
    if (!sentData || !sentData.getSentFriendRequests) return [];
    return sentData.getSentFriendRequests;
  }, [sentData]);

  const recievedRequests = useMemo(() => {
    // NOTE these are notifications, not friendships
    if (!recievedData || !recievedData.getFriendRequests) return [];
    return recievedData.getFriendRequests;
  }, [recievedData]);

  console.log('all friends', friends); // these are friendships, not users
  console.log('sent requests', sentRequests); // these are notifications, not friendships or users
  console.log('recieved requests', recievedRequests); // these are notifications, not friendships or users

  // TODO

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
                {recievedRequests.map((request: any) => {
                  return (
                    <li key={request.id}>
                      From: {request.sender_profile_id} created at:{' '}
                      {request.created_at}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="friends list">
            <h5>Your friends</h5>
            <div>
              <ul>
                {/* we need to get the friend's profile data to display here */}
                {friends.length ? (
                  <>
                    {friends.map((friend: any) => {
                      return (
                        <li key={friend.id}>
                          Friend: {friend.id} created at:{' '}
                          {
                            friend.frienshipStatus_friendship_relation[0]
                              .created_at
                          }{' '}
                        </li>
                      );
                    })}
                  </>
                ) : (
                  <li>No friends</li>
                )}
              </ul>
            </div>
          </div>
          <div className="sent-requests list">
            <h5>Pending Requests</h5>
            <div>
              <ul>
                {/* we need to get the friend's profile data to display here */}
                {sentRequests.length ? (
                  <>
                    {sentRequests.map((request: any) => {
                      return (
                        <li key={request.id}>
                          To: {request.addressee_profile_id} created at:{' '}
                          {request.created_at}
                        </li>
                      );
                    })}
                  </>
                ) : (
                  <li>No pending requests</li>
                )}
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
