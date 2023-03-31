import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useLoaderData, useTransition } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { getNewClient } from '~/apollo/getClient';
import { authenticator } from '~/auth/authenticator';
import {
  DELETE_OUTING,
  SEND_FRIEND_REQUEST,
  GET_ACCOUNT_WITH_PROFILE_DATA,
  GET_RECIEVED_FRIEND_REQUESTS,
  GET_OUTING,
  GET_PROFILES_IN_OUTING,
  GET_SENT_FRIEND_REQUESTS,
  SEND_OUTING_EMAIL,
  UPDATE_OUTING,
} from '~/constants/graphqlConstants';
// import { VALID_EMAIL_REGEX } from '~/constants/inputValidationConstants';
import logApolloError from '~/utils/getApolloError';
import EditIcon from '~/components/svgs/editIcon';
import moment from 'moment';
import { useMutation, useQuery } from '@apollo/client';
import ProfileInOuting from '~/components/outings/profileInOuting';

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
          mutation: SEND_OUTING_EMAIL,
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
  const user = await authenticator.isAuthenticated(request);
  const email = user!.authData.profile.emails[0].value;

  let outing: any;
  let profiles: any;
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
    profiles = await client.query({
      query: GET_PROFILES_IN_OUTING,
      variables: {
        id: Number(params.outingId),
      },
    });
    currentUserProfile = await client.query({
      query: GET_ACCOUNT_WITH_PROFILE_DATA,
      variables: {
        email,
      },
    });
  } catch (error) {
    logApolloError(error);
    throw new Response(JSON.stringify(error), { status: 500 });
  }
  return {
    outing,
    profiles,
    currentUserProfile,
  };
};

export default function OutingDetails() {
  const [shouldDisableSend, setShouldDisableSend] = useState(true);
  const [isHoveringNameIcon, setIsHoveringNameIcon] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [isHoveringDateIcon, setIsHoveringDateIcon] = useState(false);
  const [showEditDate, setShowEditDate] = useState(false);

  const transition = useTransition();

  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST, {
    refetchQueries: [{ query: GET_SENT_FRIEND_REQUESTS }],
  });
  const { data: sentRequestData } = useQuery(GET_SENT_FRIEND_REQUESTS);
  const { data: friendRequestData } = useQuery(GET_RECIEVED_FRIEND_REQUESTS);

  const sentRequests = useMemo(() => {
    if (!sentRequestData || !sentRequestData.getSentFriendRequests) return [];
    return sentRequestData.getSentFriendRequests;
  }, [sentRequestData]);

  const recievedRequests = useMemo(() => {
    if (!friendRequestData || !friendRequestData.getFriendRequests) return [];
    return friendRequestData.getFriendRequests;
  }, [friendRequestData]);

  const { outing, profiles, currentUserProfile } = useLoaderData();
  const { getOuting } = outing.data;
  const { accepted_profiles, pending_profiles, declined_profiles } =
    profiles.data.getProfilesInOuting;
  const { getAccountWithProfileData } = currentUserProfile.data;

  const isOutingCreator =
    accepted_profiles[0].id === getAccountWithProfileData.profile.id;
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
        <>
          {showEditName === false ? (
            <span style={{ display: 'flex', alignItems: 'center' }}>
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
            <Form method="post" style={{ paddingTop: 15 }}>
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
            <span style={{ display: 'flex', alignItems: 'center' }}>
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
            <Form method="post" style={{ paddingTop: 15 }}>
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
          <div className="add-profiles">
            <form method="post">
              {/* TODO: add validation to make sure emails are valid */}
              <label htmlFor="profile-email">Send invitation email to: </label>
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
          <h4>Profiles in Outing</h4>
          {accepted_profiles.length ? (
            <>
              {accepted_profiles.map((profile: any) => {
                return (
                  <ProfileInOuting
                    key={profile.id}
                    profile={profile}
                    sendFriendRequest={sendFriendRequest}
                    attendanceStatus="Accepted"
                    currentUser={getAccountWithProfileData.profile.id}
                    sentRequests={sentRequests}
                    recievedRequests={recievedRequests}
                  />
                );
              })}
            </>
          ) : null}
          {pending_profiles.length ? (
            <>
              {pending_profiles.map((profile: any) => {
                return (
                  <ProfileInOuting
                    key={profile.id}
                    profile={profile}
                    sendFriendRequest={sendFriendRequest}
                    attendanceStatus="Pending"
                    currentUser={getAccountWithProfileData.profile.id}
                    sentRequests={sentRequests}
                    recievedRequests={recievedRequests}
                  />
                );
              })}
            </>
          ) : null}
          {declined_profiles.length ? (
            <>
              {declined_profiles.map((profile: any) => {
                return (
                  <ProfileInOuting
                    key={profile.id}
                    profile={profile}
                    sendFriendRequest={sendFriendRequest}
                    attendanceStatus="Declined"
                    currentUser={getAccountWithProfileData.profile.id}
                    sentRequests={sentRequests}
                    recievedRequests={recievedRequests}
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
        </>
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
