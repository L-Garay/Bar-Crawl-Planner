import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useEffect, useState } from 'react';
import {
  DELETE_OUTING,
  SEND_FRIEND_REQUEST,
  GET_RECIEVED_FRIEND_REQUESTS,
  GET_OUTING,
  GET_PROFILES_IN_OUTING,
  GET_SENT_FRIEND_REQUESTS,
  SEND_OUTING_INVITES_AND_CREATE,
  UPDATE_OUTING,
  DISCONNECT_PROFILE,
  GET_ALL_FRIENDSHIPS,
  GET_PROFILE_ID,
} from '~/constants/graphqlConstants';
import { VALID_EMAIL_REGEX } from '~/constants/inputValidationConstants';
import logApolloError from '~/utils/getApolloError';
import EditIcon from '~/components/svgs/editIcon';
import moment from 'moment';
import { useMutation, useQuery } from '@apollo/client';
import ProfileInOuting from '~/components/outings/profileInOuting';
import FriendsTable from '~/components/friends/friendsTable';
import Crown32px from '~/assets/crown32px.png';
import type {
  BasicOutingData,
  FriendRequestData,
  FriendshipData,
  PartialProfilesInOuting,
} from '~/types/sharedTypes';

export const loader: LoaderFunction = async ({ request, params }) => {
  return { outingId: params.outingId };
};

export default function OutingDetails() {
  const { outingId } = useLoaderData();
  const navigate = useNavigate();
  // UI states for hovering icons and showing edit forms
  const [isHoveringNameIcon, setIsHoveringNameIcon] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [isHoveringDateIcon, setIsHoveringDateIcon] = useState(false);
  const [showEditDate, setShowEditDate] = useState(false);
  // Dynamic data from GQL
  const [friends, setFriends] = useState<FriendshipData[]>([]);
  const [outing, setOuting] = useState<BasicOutingData | null>(null);
  const [profileId, setProfileId] = useState<number>(0);
  const [sentRequests, setSentRequests] = useState<FriendRequestData[]>([]);
  const [recievedRequests, setRecievedRequests] = useState<FriendRequestData[]>(
    []
  );
  const [acceptedProfiles, setAcceptedProfiles] = useState<
    PartialProfilesInOuting[]
  >([]);
  const [pendingProfiles, setPendingProfiles] = useState<
    PartialProfilesInOuting[]
  >([]);
  const [showError, setShowError] = useState<boolean>(false);
  const [hasBreakingError, setHasBreakingError] = useState<boolean>(false);
  const [hasFriendsError, setHasFriendsError] = useState<boolean>(false);
  // Different inputs
  const [emailInput, setEmailInput] = useState<string>('');
  const [hasEmailInputError, setHasEmailInputError] = useState<boolean>(false);
  const [outingNameInput, setOutingNameInput] = useState<string>('');
  const [outingStartInput, setOutingStartInput] = useState<string>('');

  // GQL queries
  // BREAKING
  useQuery(GET_OUTING, {
    variables: {
      id: Number(outingId),
    },
    onCompleted(data) {
      setOuting(data.getOuting);
    },
    onError(error) {
      logApolloError(error);
      setShowError(true);
      setHasBreakingError(true);
    },
  });
  // BREAKING (IF WE CAN'T GET THIS THEN THERE IS A LARGER PROBLEM IN THE APP)
  useQuery(GET_PROFILE_ID, {
    onCompleted(data) {
      setProfileId(data.getProfile.id);
    },
    onError(error) {
      logApolloError(error);
      setShowError(true);
      setHasBreakingError(true);
    },
  });
  // TODO turn this into a single GET_FRIEND_REQUESTS query that returns two separate arrays (just like GET_PROFILES_IN_OUTING)
  // NONBREAKING
  useQuery(GET_SENT_FRIEND_REQUESTS, {
    onCompleted(data) {
      setSentRequests(data.getSentFriendRequests);
    },
    onError(error) {
      logApolloError(error);
      setShowError(true);
      setHasFriendsError(true);
    },
  });
  // NONBREAKING
  useQuery(GET_RECIEVED_FRIEND_REQUESTS, {
    onCompleted(data) {
      setRecievedRequests(data.getRecievedFriendRequests);
    },
    onError(error) {
      logApolloError(error);
      setShowError(true);
      setHasFriendsError(true);
    },
  });
  // BREAKING
  useQuery(GET_PROFILES_IN_OUTING, {
    variables: {
      id: Number(outingId),
    },
    onCompleted(data) {
      setAcceptedProfiles(data.getProfilesInOuting.accepted_profiles);
      setPendingProfiles(data.getProfilesInOuting.pending_profiles);
    },
    onError(error) {
      logApolloError(error);
      setShowError(true);
      setHasBreakingError(true);
    },
  });
  // NONBREAKING
  useQuery(GET_ALL_FRIENDSHIPS, {
    onCompleted: (data) => {
      setFriends(data.getAllFriendships);
    },
    onError: (error) => {
      logApolloError(error);
      setShowError(true);
      setHasFriendsError(true);
    },
  });

  // GQL mutations
  const [sendOutingInvite, { error: sendInviteError }] = useMutation(
    SEND_OUTING_INVITES_AND_CREATE,
    {
      refetchQueries: [GET_PROFILES_IN_OUTING],
      onCompleted: (data) => {
        // setInivteSent(true);
        setEmailInput('');
      },
      onError: (error) => {
        logApolloError(error);
        setShowError(true);
      },
    }
  );
  const [updateOuting, { data: outingUpdateData, error: updateOutingError }] =
    useMutation(UPDATE_OUTING, {
      onCompleted: (data) => {
        // setOutingUpdated(true);
        setShowEditName(false);
        setShowEditDate(false);
      },
      onError: (error) => {
        logApolloError(error);
        setShowError(true);
      },
    });
  const [deleteOuting, { error: deleteOutingError }] = useMutation(
    DELETE_OUTING,
    {
      onCompleted: (data) => {
        navigate('/outings/my-outings');
      },
      onError: (error) => {
        logApolloError(error);
        setShowError(true);
      },
    }
  );
  const [sendFriendRequest, { error: sendRequestError }] = useMutation(
    SEND_FRIEND_REQUEST,
    {
      refetchQueries: [GET_SENT_FRIEND_REQUESTS],
      onCompleted: (data) => {
        // setRequestSent(true);
      },
      onError: (error) => {
        logApolloError(error);
        setShowError(true);
      },
    }
  );
  const [disconnectUser, { error: disconnectError }] = useMutation(
    DISCONNECT_PROFILE,
    {
      refetchQueries: [GET_PROFILES_IN_OUTING],
      onError: (error) => {
        logApolloError(error);
        setShowError(true);
      },
    }
  );

  // when a user is connected to the outing, prisma 'unshifts' the user to the front of the accepted_profiles array
  // however we want the first people who joined to be at the top, so we reverse the array

  // NOTE WHAT'S CRAZY IS THAT THE ORDER IS SOMETIMES 'RANDOM'
  // I'VE OBSERVED THE THIRD USER TO JOIN, LISTED AS THE FIRST USER IN THE ARRAY (I.E. THEY CREATED THE OUTING)
  // IF YOU NAVIGATE TO A DIFFERENT TAB AND THEN COME BACK (QUERRIES ARE FIRED AGAIN), THE ORDER CHANGES TO THE CORRECT ORDER
  // TODO look into why that is and if there's a way to fix it

  let sortedAcceptedProfiles: PartialProfilesInOuting[] = [];
  acceptedProfiles.forEach((profile: PartialProfilesInOuting) =>
    sortedAcceptedProfiles.unshift(profile)
  );
  // console.log(
  //   'accepted: ',
  //   acceptedProfiles,
  //   'sorted: ',
  //   sortedAcceptedProfiles
  // );
  // TODO figure out why all of a sudden this produces this error: "Uncaught TypeError: 0 is read-only"
  // acceptedProfiles.reverse();
  let sortedPendingProfiles: PartialProfilesInOuting[] = [];
  pendingProfiles.forEach((profile: PartialProfilesInOuting) =>
    sortedPendingProfiles.unshift(profile)
  );
  // pendingProfiles.reverse();

  const isOutingCreator = outing?.creator_profile_id == profileId;

  // input validations
  const EMAIL_MIN_LENGTH = 7;
  const currentDay = new Date();
  const currentDayInputValue = moment(currentDay).format('YYYY-MM-DDTHH:mm');
  const maxDate = currentDay.setFullYear(currentDay.getFullYear() + 1);
  const maxDateValue = moment(maxDate).format('YYYY-MM-DDTHH:mm');

  // live updated outing name and date
  const nameToShow: string = outingUpdateData
    ? outingUpdateData.updateOuting.name
    : outing?.name;
  const dateToShow: string = outingUpdateData
    ? outingUpdateData.updateOuting.start_date_and_time
    : outing?.start_date_and_time;

  useEffect(() => {
    const errorTimeout = setTimeout(() => {
      setShowError(false);
      setHasEmailInputError(false);
    }, 5000);

    return () => clearTimeout(errorTimeout);
  }, [showError]);

  useEffect(() => {
    if (hasBreakingError) {
      throw new Error('Breaking error in OutingDetails.tsx'); // need to think about what this should be
    }
  }, [hasBreakingError]);

  return (
    <div>
      {outing ? (
        <div className="outing-details-container">
          <div className="outing-detials">
            {showEditName === false ? (
              <span className="input-group">
                <h1>{nameToShow}</h1>
                {isOutingCreator ? (
                  <span
                    onMouseEnter={() => setIsHoveringNameIcon(true)}
                    onMouseLeave={() => setIsHoveringNameIcon(false)}
                    onClick={() => {
                      setShowEditDate(false);
                      setShowEditName(true);
                      setIsHoveringNameIcon(false);
                    }}
                  >
                    <EditIcon
                      pathId={outing.name}
                      fill={isHoveringNameIcon ? '#20b2aa' : undefined}
                      size="medium"
                    />
                  </span>
                ) : null}
              </span>
            ) : (
              <div>
                <input
                  type="text"
                  name="outing-name"
                  id="outing-name"
                  spellCheck
                  onChange={(e) => setOutingNameInput(e.target.value)}
                  value={outingNameInput}
                />
                <button
                  onClick={() => {
                    updateOuting({
                      variables: {
                        id: outing.id,
                        name: outingNameInput ? outingNameInput : outing.name,
                        start_date_and_time: outing.start_date_and_time,
                      },
                    });
                  }}
                >
                  Save Change
                </button>
                <button
                  onClick={() => {
                    setShowEditName(false);
                    setOutingNameInput('');
                  }}
                >
                  Cancel edit
                </button>
                {showError && updateOutingError && (
                  <div className="error-message">
                    <p>We are unable to save your change at this time.</p>
                  </div>
                )}
              </div>
            )}
            {showEditDate === false ? (
              <span className="input-group">
                <p>{dateToShow}</p>
                {isOutingCreator ? (
                  <span
                    onMouseEnter={() => setIsHoveringDateIcon(true)}
                    onMouseLeave={() => setIsHoveringDateIcon(false)}
                    onClick={() => {
                      setShowEditName(false);
                      setShowEditDate(true);
                      setIsHoveringDateIcon(false);
                    }}
                  >
                    <EditIcon
                      pathId={outing.start_date_and_time}
                      fill={isHoveringDateIcon ? '#20b2aa' : undefined}
                      size="small"
                    />
                  </span>
                ) : null}
              </span>
            ) : (
              <div>
                <input
                  type="datetime-local"
                  name="outing-date"
                  id="outing-date"
                  min={currentDayInputValue}
                  max={maxDateValue}
                  defaultValue={outing.start_date_and_time}
                  onChange={(e) => setOutingStartInput(e.target.value)}
                />
                <button
                  onClick={() => {
                    updateOuting({
                      variables: {
                        id: outing.id,
                        name: outing.name,
                        start_date_and_time: outingStartInput
                          ? outingStartInput
                          : outing.start_date_and_time,
                      },
                    });
                  }}
                >
                  Save Change
                </button>
                <button
                  onClick={() => {
                    setShowEditDate(false);
                    setOutingStartInput('');
                  }}
                >
                  Cancel edit
                </button>
                {showError && updateOutingError && (
                  <div className="error-message">
                    <p>We are unable to save your change at this time.</p>
                  </div>
                )}
              </div>
            )}

            <br />
            <>
              {isOutingCreator ? (
                <div className="add-profiles">
                  <div className="add-profiles-input">
                    <label htmlFor="profile-email">
                      Send invitation email to:{' '}
                    </label>
                    <input
                      type="text"
                      name="profile-email"
                      id="profile-email"
                      title="figure out what pattern(s) to show here"
                      minLength={EMAIL_MIN_LENGTH} // what should this be?
                      onChange={(e) => setEmailInput(e.target.value)}
                      value={emailInput}
                    />
                    <button
                      onClick={() => {
                        const regex = new RegExp(VALID_EMAIL_REGEX);
                        const match = regex.test(emailInput);
                        if (match) {
                          sendOutingInvite({
                            variables: {
                              emails: [emailInput],
                              start_date_and_time: outing.start_date_and_time,
                              outing_id: outing.id,
                            },
                          });
                        } else {
                          setShowError(true);
                          setHasEmailInputError(true);
                        }
                      }}
                      disabled={emailInput.length < EMAIL_MIN_LENGTH}
                    >
                      Send Invite
                    </button>
                  </div>
                  {showError && hasEmailInputError ? (
                    <div className="error-message">
                      <p>
                        The email format is invalid, please check and try again.
                      </p>
                    </div>
                  ) : showError && sendInviteError ? (
                    <div className="error-message">
                      <p>We are unable to send the invitation at this time.</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
            <h4>Profiles in Outing</h4>
            {sortedAcceptedProfiles.length ? (
              <>
                {sortedAcceptedProfiles.map((profile: any, index: number) => {
                  const outingCreator = profile.id == outing.creator_profile_id;

                  return (
                    <div key={profile.id} className="user-group">
                      {outingCreator ? (
                        <img
                          src={Crown32px}
                          alt="small animated gold crown"
                          className="creator-crown"
                        />
                      ) : null}

                      <ProfileInOuting
                        profile={profile}
                        sendFriendRequest={sendFriendRequest}
                        attendanceStatus="Accepted"
                        currentUserId={profileId}
                        sentRequests={sentRequests}
                        recievedRequests={recievedRequests}
                        friends={friends}
                        disconnectUser={disconnectUser}
                        outingId={outing.id}
                        isOutingCreator={isOutingCreator}
                        friendsError={hasFriendsError}
                      />
                    </div>
                  );
                })}
              </>
            ) : null}
            {sortedPendingProfiles.length ? (
              <>
                {sortedPendingProfiles.map((profile: any) => {
                  return (
                    <ProfileInOuting
                      key={profile.id}
                      profile={profile}
                      sendFriendRequest={sendFriendRequest}
                      attendanceStatus="Pending"
                      currentUserId={profileId}
                      sentRequests={sentRequests}
                      recievedRequests={recievedRequests}
                      friends={friends}
                      disconnectUser={disconnectUser}
                      outingId={outing.id}
                      isOutingCreator={isOutingCreator}
                      friendsError={hasFriendsError}
                    />
                  );
                })}
              </>
            ) : null}
            <br />
            {isOutingCreator ? (
              <div className="delete-outing-container">
                <button
                  className="delete-outing"
                  onClick={() => {
                    deleteOuting({
                      variables: {
                        id: outing.id,
                      },
                    });
                  }}
                >
                  Delete Outing
                </button>
                {showError && deleteOutingError && (
                  <div className="error-message">
                    <p>We are unable to delete the outing at this time.</p>
                  </div>
                )}
              </div>
            ) : null}
            {showError && disconnectError ? (
              <div className="error-message">
                <p>We are unable to remove the user at this time.</p>
              </div>
            ) : showError && sendRequestError ? (
              <div className="error-message">
                <p>We are unable to send the friend request at this time.</p>
              </div>
            ) : null}
          </div>
          {isOutingCreator ? (
            <FriendsTable
              userId={profileId}
              outingId={outing.id}
              outingName={outing.name}
              startDateAndTime={outing.start_date_and_time}
              pendingProfiles={sortedPendingProfiles}
              acceptedProfiles={sortedAcceptedProfiles}
            />
          ) : null}
        </div>
      ) : (
        <p>Outing not found</p>
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: { error: any }) {
  return (
    <main>
      <div className="error-container">
        <h1>Uh-oh looks like we lost our glasses, a new pair is on the way</h1>
        <p>
          Please try again later, and if the issue still persists contact
          customer support
        </p>
        <small>Call (208) 999-8888 or email test@mail.com</small>
      </div>
    </main>
  );
}

// Will catch responses thrown from loaders and actions, any errors thrown from component will only get caught by error boundary
export function CatchBoundary() {
  return (
    <main>
      <div className="error-container">
        <h1>Uh-oh looks like we lost our glasses, a new pair is on the way</h1>
        <p>
          Please try again later, and if the issue still persists contact
          customer support
        </p>
        <small>Call (208) 999-8888 or email test@mail.com</small>
      </div>
    </main>
  );
}
