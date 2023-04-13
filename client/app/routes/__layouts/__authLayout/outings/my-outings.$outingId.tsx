import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData, useTransition } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { getNewClient } from '~/apollo/getClient';
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
  GET_PROFILE,
} from '~/constants/graphqlConstants';
// import { VALID_EMAIL_REGEX } from '~/constants/inputValidationConstants';
import logApolloError from '~/utils/getApolloError';
import EditIcon from '~/components/svgs/editIcon';
import moment from 'moment';
import { useMutation, useQuery } from '@apollo/client';
import ProfileInOuting from '~/components/outings/profileInOuting';
import FriendsTable from '~/components/friends/friendsTable';
import Crown32px from '~/assets/crown32px.png';
import type { PartialProfilesInOuting } from '~/types/sharedTypes';

export const action: ActionFunction = async ({ request, params }) => {
  const client = await getNewClient(request);
  const formData = await request.formData();
  const intent = formData.get('intent');

  switch (intent) {
    case 'post':
      const emails = formData.get('profile-email') as string;
      const emailsArray = emails.split(',');

      const start_date_and_time = formData.get('start-date-and-time') as string;
      const outingId = Number(params.outingId);

      try {
        const data = await client.mutate({
          mutation: SEND_OUTING_INVITES_AND_CREATE,
          variables: {
            emails: emailsArray,
            start_date_and_time,
            outing_id: outingId,
          },
        });
        return data.data;
      } catch (error) {
        logApolloError(error);
        // Don't throw an error here, because if the email fails they should still be able to interact with the rest of the page
        // throw new Response(JSON.stringify(error), { status: 500 });
      }
      break;
    case 'put':
      const outingName = formData.get('outing-name') as string;
      const outingDate = formData.get('outing-date') as string;
      const outing_id = Number(params.outingId);

      try {
        const data = await client.mutate({
          mutation: UPDATE_OUTING,
          variables: {
            id: outing_id,
            name: outingName,
            start_date_and_time: outingDate,
          },
        });
        return data.data;
      } catch (error) {
        logApolloError(error);
      }

      break;
    case 'delete':
      const outingid = Number(params.outingId);
      try {
        await client.mutate({
          mutation: DELETE_OUTING,
          variables: {
            id: outingid,
          },
        });
        return redirect('/outings/my-outings/');
      } catch (error) {
        logApolloError(error);
        // Don't throw an error here, because if they can't delete an outing they should still be able to interact with the rest of the page
      }
      break;

    default:
      return 'test';
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const client = await getNewClient(request);
  // should never not be authenticated at this point

  let outing: any;
  let currentUserProfile: any;
  // TODO 1. add a query to get the friends of the user
  // TODO 2. once that is working, combine the 4 querries into one large one that calls the 4 sub queries
  //  since GET_PROFILES_IN_OUTING is also a parent query of 3 sub querries itself, there will actually be 6 total sub querries
  try {
    outing = await client.query({
      query: GET_OUTING,
      variables: {
        id: Number(params.outingId),
      },
    });
    currentUserProfile = await client.query({
      query: GET_PROFILE,
    });
  } catch (error) {
    logApolloError(error);
    throw new Response(JSON.stringify(error), { status: 500 });
  }
  return {
    outing,
    currentUserProfile,
    outingId: params.outingId,
  };
};

export default function OutingDetails() {
  const [shouldDisableSend, setShouldDisableSend] = useState(true);
  const [isHoveringNameIcon, setIsHoveringNameIcon] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [isHoveringDateIcon, setIsHoveringDateIcon] = useState(false);
  const [showEditDate, setShowEditDate] = useState(false);

  const { outing, currentUserProfile, outingId } = useLoaderData();
  const transition = useTransition();

  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST, {
    refetchQueries: [GET_SENT_FRIEND_REQUESTS],
  });
  const [disconnectUser] = useMutation(DISCONNECT_PROFILE, {
    refetchQueries: [GET_PROFILES_IN_OUTING],
  });

  const { data: sentRequestData } = useQuery(GET_SENT_FRIEND_REQUESTS);
  const { data: friendRequestData } = useQuery(GET_RECIEVED_FRIEND_REQUESTS);
  const { data: profilesInOutingData, loading: profilesLoading } = useQuery(
    GET_PROFILES_IN_OUTING,
    {
      variables: {
        id: Number(outingId),
      },
    }
  );

  const hasSentRequest =
    sentRequestData && sentRequestData.getSentFriendRequests;
  const sentRequests = hasSentRequest
    ? sentRequestData.getSentFriendRequests
    : [];

  const hasRecievedRequests =
    friendRequestData && friendRequestData.getFriendRequests;
  const recievedRequests = hasRecievedRequests
    ? friendRequestData.getFriendRequests
    : [];

  const { getOuting } = outing.data;

  const accepted_profiles = useMemo(() => {
    if (profilesLoading) return [];
    return profilesInOutingData.getProfilesInOuting.accepted_profiles;
  }, [profilesLoading, profilesInOutingData]);

  const pending_profiles = useMemo(() => {
    if (profilesLoading) return [];
    return profilesInOutingData.getProfilesInOuting.pending_profiles;
  }, [profilesLoading, profilesInOutingData]);

  const { getProfile } = currentUserProfile.data;

  // when a user is connected to the outing, prisma 'unshifts' the user to the front of the accepted_profiles array
  // I was able to determine this when an invited user accepted the invitation and was added, they're name appeared at the top of the list
  // meaning they were the first index in accepted_profiles
  // so we'll need to account for this when dealing with relational data collections
  let sortedAcceptedProfiles: PartialProfilesInOuting[] = [];
  accepted_profiles.forEach((profile: PartialProfilesInOuting) =>
    sortedAcceptedProfiles.unshift(profile)
  );
  // TODO figure out why all of a sudden this produces this error: "Uncaught TypeError: 0 is read-only"
  // accepted_profiles.reverse();

  let sortedPendingProfiles: PartialProfilesInOuting[] = [];
  pending_profiles.forEach((profile: PartialProfilesInOuting) =>
    sortedPendingProfiles.unshift(profile)
  );
  // pending_profiles.reverse();

  const isOutingCreator = sortedAcceptedProfiles.length
    ? sortedAcceptedProfiles[0].id == getOuting.creator_profile_id &&
      sortedAcceptedProfiles[0].id == getProfile.id
    : false;

  const EMAIL_MIN_LENGTH = 7;

  const currentDay = new Date();
  const currentDayInputValue = moment(currentDay).format('YYYY-MM-DDTHH:mm');
  const maxDate = currentDay.setFullYear(currentDay.getFullYear() + 1);
  const maxDateValue = moment(maxDate).format('YYYY-MM-DDTHH:mm');

  useEffect(() => {
    if (transition.state === 'loading') {
      setShowEditDate(false);
      setShowEditName(false);
    }
  }, [transition.state]);

  const transitionName = useMemo(
    () => transition.submission?.formData.get('outing-name'),
    [transition.submission]
  );
  const transitionDate = useMemo(
    () => transition.submission?.formData.get('outing-date'),
    [transition.submission]
  );

  const nameToShow = transitionName ? transitionName : getOuting.name;

  const dateToShow = transitionDate
    ? transitionDate
    : getOuting.start_date_and_time;

  return (
    <div>
      {getOuting ? (
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
                      pathId={getOuting.name}
                      fill={isHoveringNameIcon ? '#20b2aa' : undefined}
                      size="medium"
                    />
                  </span>
                ) : null}
              </span>
            ) : (
              <Form method="post" className="form">
                <input
                  type="text"
                  name="outing-name"
                  id="outing-name"
                  spellCheck
                  defaultValue={getOuting.name}
                />
                <button type="submit" name="intent" value="put">
                  Save Change
                </button>
              </Form>
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
                      pathId={getOuting.start_date_and_time}
                      fill={isHoveringDateIcon ? '#20b2aa' : undefined}
                      size="small"
                    />
                  </span>
                ) : null}
              </span>
            ) : (
              <Form method="post" className="form">
                <input
                  type="datetime-local"
                  name="outing-date"
                  id="outing-date"
                  min={currentDayInputValue}
                  max={maxDateValue}
                  defaultValue={getOuting.start_date_and_time}
                />
                <button type="submit" name="intent" value="put">
                  Save Change
                </button>
              </Form>
            )}

            <br />
            <>
              {isOutingCreator ? (
                <div className="add-profiles">
                  <form method="post">
                    {/* TODO: add validation to make sure emails are valid */}
                    {/* NOTE if we want users to be able to submit multiple emails at the same time, we will need to change the input type to be textfield or something else that just takes strings, but email input and it's default validation rules won't allow mutliple emails */}
                    <label htmlFor="profile-email">
                      Send invitation email to:{' '}
                    </label>
                    <input
                      type="email"
                      name="profile-email"
                      id="profile-email"
                      // TODO figure out why this regex is causing 'garay.logan+test1@gmail.com' to fail in the app, but passes at https://regexr.com
                      // pattern={`${VALID_EMAIL_REGEX}`}
                      title="figure out what pattern(s) to show here"
                      minLength={EMAIL_MIN_LENGTH} // what should this be?
                      onChange={(e) => {
                        setShouldDisableSend(
                          e.target.value.length < EMAIL_MIN_LENGTH
                        );
                      }}
                    />
                    <input
                      type="hidden"
                      name="start-date-and-time"
                      value={getOuting.start_date_and_time}
                    />
                    <button
                      type="submit"
                      name="intent"
                      value="post"
                      disabled={shouldDisableSend}
                    >
                      Send Invite
                    </button>
                  </form>
                </div>
              ) : null}
            </>
            <h4>Profiles in Outing</h4>
            {sortedAcceptedProfiles.length ? (
              <>
                {sortedAcceptedProfiles.map((profile: any, index: number) => {
                  const outingCreator =
                    profile.id == getOuting.creator_profile_id;

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
                        currentUserId={getProfile.id}
                        sentRequests={sentRequests}
                        recievedRequests={recievedRequests}
                        disconnectUser={disconnectUser}
                        outingId={getOuting.id}
                        isOutingCreator={isOutingCreator}
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
                      currentUserId={getProfile.id}
                      sentRequests={sentRequests}
                      recievedRequests={recievedRequests}
                      disconnectUser={disconnectUser}
                      outingId={getOuting.id}
                      isOutingCreator={isOutingCreator}
                    />
                  );
                })}
              </>
            ) : null}
            <br />
            {isOutingCreator ? (
              <div className="delete-outing-container">
                <form method="post">
                  <button
                    className="delete-outing"
                    name="intent"
                    value="delete"
                    type="submit"
                  >
                    Delete Outing
                  </button>
                </form>
              </div>
            ) : null}
          </div>
          {isOutingCreator ? (
            <FriendsTable
              userId={getProfile.id}
              outingId={getOuting.id}
              outingName={getOuting.name}
              startDateAndTime={getOuting.start_date_and_time}
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
