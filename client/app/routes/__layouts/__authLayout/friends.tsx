import type { LinksFunction } from '@remix-run/node';
import {
  UPDATE_FRIEND,
  GET_ALL_FRIENDSHIPS,
  GET_RECIEVED_FRIEND_REQUESTS,
  GET_SENT_FRIEND_REQUESTS,
  GET_PROFILE,
  BLOCK_PROFILE,
  GET_RECIEVED_FRIEND_REQUEST_COUNT,
  SEND_FRIEND_REQUEST_SOCIAL_PIN,
} from '~/constants/graphqlConstants';
import friendsStyles from '~/generatedStyles/friends.css';
import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import logApolloError from '~/utils/getApolloError';

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
  const [addFriendInputValue, setAddFriendInputValue] = useState<string>('');
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const { data: profileData } = useQuery(GET_PROFILE);
  const { data: friendsData, error: friendsError } =
    useQuery(GET_ALL_FRIENDSHIPS);
  const { data: sentData, error: sentError } = useQuery(
    GET_SENT_FRIEND_REQUESTS,
    {
      onError: (error) => {
        logApolloError(error);
        setShowErrorMessage(true);
      },
    }
  );

  const { data: recievedData, error: recievedError } = useQuery(
    GET_RECIEVED_FRIEND_REQUESTS,
    {
      onError: (error) => {
        logApolloError(error);
        setShowErrorMessage(true);
      },
    }
  );

  const [sendRequest, { data: requestData, error: requestError }] = useMutation(
    SEND_FRIEND_REQUEST_SOCIAL_PIN,
    {
      refetchQueries: [GET_SENT_FRIEND_REQUESTS],
      onError: (error) => {
        logApolloError(error);
        setShowErrorMessage(true);
      },
    }
  );

  const [updateFriend, { data: updateData, error: updateError }] = useMutation(
    UPDATE_FRIEND,
    {
      refetchQueries: [
        GET_ALL_FRIENDSHIPS,
        GET_RECIEVED_FRIEND_REQUESTS,
        GET_SENT_FRIEND_REQUESTS,
        GET_RECIEVED_FRIEND_REQUEST_COUNT,
      ],
      onError: (error) => {
        logApolloError(error);
        setShowErrorMessage(true);
      },
    }
  );
  const [blockProfile, { data: blockData, error: blockError }] = useMutation(
    BLOCK_PROFILE,
    {
      onError: (error) => {
        logApolloError(error);
        setShowErrorMessage(true);
      },
    }
  );

  const friends = useMemo(() => {
    if (!friendsData || !friendsData.getAllFriendships) return [];
    return friendsData.getAllFriendships;
  }, [friendsData]);

  const sentRequests = useMemo(() => {
    if (!sentData || !sentData.getSentFriendRequests) return [];
    return sentData.getSentFriendRequests;
  }, [sentData]);

  const recievedRequests = useMemo(() => {
    if (!recievedData || !recievedData.getRecievedFriendRequests) return [];
    return recievedData.getRecievedFriendRequests;
  }, [recievedData]);

  useEffect(() => {
    const errorTimeout = setTimeout(() => {
      setShowErrorMessage(false);
    }, 5000);

    return () => clearTimeout(errorTimeout);
  }, [showErrorMessage]);

  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the friends page</h1>
        <div className="add-friend">
          <div className="add-friend-form" style={{ display: 'flex' }}>
            <label htmlFor="addFriend">Add a friend: </label>
            <input
              type="text"
              name="addFriend"
              id="addFriend"
              onChange={(event) => setAddFriendInputValue(event.target.value)}
              value={addFriendInputValue}
            />
            <button
              disabled={addFriendInputValue.length == 0}
              onClick={() => {
                sendRequest({
                  variables: {
                    social_pin: addFriendInputValue,
                  },
                });
                setAddFriendInputValue('');
              }}
            >
              Send Request
            </button>
          </div>
          <div className="add-friend-status" style={{ height: 50 }}>
            {requestError && showErrorMessage && (
              <p>
                {requestError.graphQLErrors[0].message == 'Already friends'
                  ? 'Already friends'
                  : 'Error trying to add friend. If problem continues contact support.'}
              </p>
            )}
          </div>
        </div>
        <div className="friends-lists">
          <div className="friend-requests list">
            <h5>Your recieved friend requests</h5>
            <div>
              <ul>
                {/* we need to get the friend's profile data to display here */}
                {recievedRequests.map((request: any) => {
                  return (
                    <li key={request.id}>
                      From: {request.requestor_profile_id} created at:{' '}
                      {request.created_at}{' '}
                      <span style={{ display: 'block' }}>
                        <button
                          onClick={() =>
                            updateFriend({
                              variables: {
                                friendship_id: request.id,
                                status_code: 'A',
                              },
                            })
                          }
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            updateFriend({
                              variables: {
                                friendship_id: request.id,
                                status_code: 'D',
                              },
                            })
                          }
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => {
                            updateFriend({
                              variables: {
                                friendship_id: request.id,
                                status_code: 'B',
                              },
                            });
                            blockProfile({
                              variables: {
                                blocked_profile_id:
                                  request.requestor_profile_id,
                              },
                            });
                          }}
                        >
                          Block
                        </button>
                      </span>
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
                          Friend: {friend.id} created at: {friend.created_at}{' '}
                          <span style={{ display: 'block' }}>
                            <button
                              onClick={() =>
                                updateFriend({
                                  variables: {
                                    friendship_id: friend.id,
                                    status_code: 'R',
                                  },
                                })
                              }
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => {
                                updateFriend({
                                  variables: {
                                    friendship_id: friend.id,
                                    status_code: 'B',
                                  },
                                });
                                const blocked_profile_id =
                                  friend.requestor_profile_id === profileData.id
                                    ? friend.addressee_profile_id
                                    : friend.requestor_profile_id;
                                blockProfile({
                                  variables: {
                                    blocked_profile_id,
                                  },
                                });
                              }}
                            >
                              Block
                            </button>
                          </span>
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
            <h5>Pending sent requests</h5>
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
