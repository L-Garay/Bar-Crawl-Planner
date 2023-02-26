import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { getNewClient } from '~/apollo/getClient';
import {
  GET_OUTING,
  GET_PROFILES_IN_OUTING,
  SEND_OUTING_EMAIL,
} from '~/constants/graphqlConstants';
import { VALID_EMAIL_REGEX } from '~/constants/inputValidationConstants';
import logApolloError from '~/utils/getApolloError';

export const action: ActionFunction = async ({ request, params }) => {
  const client = await getNewClient(request);
  const formData = await request.formData();

  const emails = formData.get('profile-email') as string;
  const emailsArray = emails.split(',');
  const start_date_and_time = formData.get('start-date-and-time') as string;
  const outing_id = Number(params.outingId);

  try {
    const data = await client.mutate({
      mutation: SEND_OUTING_EMAIL,
      variables: {
        emails: emailsArray,
        start_date_and_time,
        outing_id,
      },
    });
    return data;
  } catch (error) {
    logApolloError(error);
    // Don't throw an error here, because if the email fails they should still be able to interact with the rest of the page
    // throw new Response(JSON.stringify(error), { status: 500 });
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const client = await getNewClient(request);

  let outing: any;
  let profiles: any;

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
  } catch (error) {
    logApolloError(error);
    throw new Response(JSON.stringify(error), { status: 500 });
  }
  return { outing, profiles };
};

export default function OutingDetails() {
  const { outing, profiles } = useLoaderData();
  const { getOuting } = outing.data;
  const { getProfilesInOuting } = profiles.data;
  const { accepted_profiles, pending_profiles, declined_profiles } =
    getProfilesInOuting;
  console.log(accepted_profiles, pending_profiles);

  return (
    <div>
      {getOuting ? (
        <>
          <h1>{getOuting.name}</h1>
          <p>{getOuting.start_date_and_time}</p>
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
                minLength={5} // what should this be?
              />
              <input
                type="hidden"
                name="start-date-and-time"
                value={getOuting.start_date_and_time}
              />
              <button type="submit">Send Invite</button>
            </form>
          </div>
          <h4>Profiles in Outing</h4>
          {accepted_profiles.length ? (
            <>
              {accepted_profiles.map((profile: any) => {
                return (
                  <div key={profile.id} style={{ display: 'flex' }}>
                    <p style={{ color: 'green', paddingRight: 10 }}>
                      {profile.name} with id {profile.id}
                    </p>
                    <p>(Accepted)</p>
                  </div>
                );
              })}
            </>
          ) : null}
          {pending_profiles.length ? (
            <>
              {pending_profiles.map((profile: any) => {
                return (
                  <div key={profile.id} style={{ display: 'flex' }}>
                    <p style={{ color: 'grey', paddingRight: 10 }}>
                      {profile.name} with id {profile.id}
                    </p>
                    <p>(Pending)</p>
                  </div>
                );
              })}
            </>
          ) : null}
          {declined_profiles.length ? (
            <>
              {declined_profiles.map((profile: any) => {
                return (
                  <div key={profile.id} style={{ display: 'flex' }}>
                    <p style={{ color: 'red', paddingRight: 10 }}>
                      {profile.name} with id {profile.id}
                    </p>
                    <p>(Declined)</p>
                  </div>
                );
              })}
            </>
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
