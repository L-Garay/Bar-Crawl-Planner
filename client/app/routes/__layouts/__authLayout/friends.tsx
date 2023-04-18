import type { LinksFunction } from '@remix-run/node';
import {
  UPDATE_FRIEND,
  GET_ALL_FRIENDSHIPS,
  GET_RECIEVED_FRIEND_REQUESTS,
  GET_SENT_FRIEND_REQUESTS,
  BLOCK_PROFILE,
  GET_RECIEVED_FRIEND_REQUEST_COUNT,
  SEND_FRIEND_REQUEST_SOCIAL_PIN,
  GET_PROFILE_ID,
} from '~/constants/graphqlConstants';
import friendsStyles from '~/generatedStyles/friends.css';
import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import logApolloError from '~/utils/getApolloError';
import type { FriendRequestData, FriendshipData } from '~/types/sharedTypes';
import moment from 'moment';

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
  const [profileId, setProfileId] = useState<number>(0);
  const [friends, setFriends] = useState<FriendshipData[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestData[]>([]);
  const [recievedRequests, setRecievedRequests] = useState<FriendRequestData[]>(
    []
  );
  const [addFriendInputValue, setAddFriendInputValue] = useState<string>('');
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [invalidFriendInput, setInvalidFriendInput] = useState<boolean>(false);

  // NOTE this is used in blocking a profile, not sure what to do if we can't get the id
  const { data: profileData } = useQuery(GET_PROFILE_ID, {
    onCompleted: (data) => {
      setProfileId(data.getProfile.id);
    },
  });

  const { error: friendsError } = useQuery(GET_ALL_FRIENDSHIPS, {
    onCompleted: (data) => {
      setFriends(data.getAllFriendships);
    },
    onError: (err) => {
      logApolloError(err);
      setShowErrorMessage(true);
    },
  });

  const { error: sentError } = useQuery(GET_SENT_FRIEND_REQUESTS, {
    onCompleted: (data) => {
      setSentRequests(data.getSentFriendRequests);
    },
    onError: (error) => {
      logApolloError(error);
      setShowErrorMessage(true);
    },
  });

  const { error: recievedError } = useQuery(GET_RECIEVED_FRIEND_REQUESTS, {
    onCompleted: (data) => {
      setRecievedRequests(data.getRecievedFriendRequests);
    },
    onError: (error) => {
      logApolloError(error);
      setShowErrorMessage(true);
    },
  });

  const [sendRequest, { error: requestError }] = useMutation(
    SEND_FRIEND_REQUEST_SOCIAL_PIN,
    {
      refetchQueries: [GET_SENT_FRIEND_REQUESTS],
      onError: (error) => {
        logApolloError(error);
        setShowErrorMessage(true);
      },
    }
  );

  const [updateFriend, { error: updateError }] = useMutation(UPDATE_FRIEND, {
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
  });
  const [blockProfile, { error: blockError }] = useMutation(BLOCK_PROFILE, {
    onError: (error) => {
      logApolloError(error);
      setShowErrorMessage(true);
    },
  });

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
          <div className="add-friend-form">
            <h5>
              Add a friend using their social pin (found on profile page ex:
              3jF43V_9)
            </h5>
            <label htmlFor="addFriend">Add a friend: </label>
            <input
              type="text"
              name="addFriend"
              id="addFriend"
              title="Please enter a valid 8 character social pin (alphanumeric and dashes only)"
              onChange={(event) => setAddFriendInputValue(event.target.value)}
              value={addFriendInputValue}
              maxLength={8} // since we know the social pin is 8 characters
            />
            <button
              disabled={addFriendInputValue.length != 8}
              onClick={() => {
                const regex = new RegExp('^[A-Za-z0-9-]+$');
                const match = regex.test(addFriendInputValue);
                if (match) {
                  sendRequest({
                    variables: {
                      social_pin: addFriendInputValue,
                    },
                  });
                  setAddFriendInputValue('');
                  setInvalidFriendInput(false);
                } else {
                  setInvalidFriendInput(true);
                  setShowErrorMessage(true);
                }
              }}
            >
              Send Request
            </button>
          </div>
          <small className="add-friend-tip">
            Social pin is 8 character alphanumeric combination of letters and
            numbers that may include "-" and "_"
          </small>
          <div className="add-friend-status">
            {requestError && showErrorMessage && (
              <p>
                {requestError.graphQLErrors[0].message ==
                'Already friends or requested'
                  ? 'Already friends or requested'
                  : 'Error trying to add friend. If problem continues contact support.'}
              </p>
            )}
            {invalidFriendInput && showErrorMessage && (
              <p>The input you provided is invalid, please see example.</p>
            )}
          </div>
        </div>
        <div className="friends-lists">
          <div className="friend-requests list">
            <h5>Your recieved friend requests</h5>
            {recievedError && recievedRequests.length == 0 && (
              <p>Unable to get your friend requests at this time.</p>
            )}
            {!recievedError && recievedRequests.length == 0 && (
              <p>No new requests at this time.</p>
            )}
            {!recievedError && recievedRequests.length ? (
              <ul>
                {/* we need to get the friend's profile data to display here */}
                {recievedRequests.map((request: any) => {
                  return (
                    <div className="request" key={request.id}>
                      <li>
                        <div>
                          From: {request.requestor_profile_relation.name}
                        </div>
                        <div>
                          Recieved: {moment(request.created_at).fromNow()}
                        </div>
                        <span className="friend-buttons">
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
                              // TODO make these two mutations a single transaction
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
                                  friend_id: request.id,
                                },
                              });
                            }}
                          >
                            Block
                          </button>
                        </span>
                      </li>
                      {(updateError || blockError) && showErrorMessage && (
                        <p>We are unable to perform that action at this time</p>
                      )}
                    </div>
                  );
                })}
              </ul>
            ) : null}
          </div>
          <div className="friends list">
            <h5>Your friends</h5>
            {friendsError && friends.length == 0 && (
              <p>We are unable to get your friends at this time.</p>
            )}
            {!friendsError && friends.length == 0 && (
              <p>Send out your first request now!</p>
            )}
            {!friendsError && friends.length ? (
              <ul>
                {/* we need to get the friend's profile data to display here */}

                {friends.map((friend: any) => {
                  const isRequestor = friend.requestor_profile_id === profileId;
                  const name = isRequestor
                    ? friend.addressee_profile_relation.name
                    : friend.requestor_profile_relation.name;
                  return (
                    <li key={friend.id}>
                      <div>(profile img here) {name}</div>
                      <span className="friend-buttons">
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
                            // TODO make these two mutations a single transaction
                            updateFriend({
                              variables: {
                                friendship_id: friend.id,
                                status_code: 'B',
                              },
                            });
                            const blocked_profile_id =
                              friend.requestor_profile_id === profileId
                                ? friend.addressee_profile_id
                                : friend.requestor_profile_id;
                            blockProfile({
                              variables: {
                                blocked_profile_id,
                                friend_id: friend.id,
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
            ) : null}
          </div>
          <div className="sent-requests list">
            <h5>Pending sent requests</h5>
            {sentError && sentRequests.length == 0 && (
              <p>We are unable to get your pending requests at this time</p>
            )}
            {!sentError && sentRequests.length == 0 && (
              <p>You haven't sent a request out recently.</p>
            )}
            {!sentError && sentRequests.length ? (
              <ul>
                {/* we need to get the friend's profile data to display here */}
                <>
                  {sentRequests.map((request: any) => {
                    return (
                      <li key={request.id}>
                        <div>To: {request.addressee_profile_relation.name}</div>
                        <div>Sent: {moment(request.created_at).fromNow()}</div>
                      </li>
                    );
                  })}
                </>
              </ul>
            ) : null}
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
