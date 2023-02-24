import { useMutation } from '@apollo/client';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { getNewClient } from '~/apollo/getClient';
import {
  GET_OUTING,
  GET_PROFILES_IN_OUTING,
  SEND_OUTING_EMAIL,
} from '~/constants/graphqlConstants';
import { VALID_EMAIL_REGEX } from '~/constants/inputValidationConstants';
import logApolloError from '~/utils/getApolloError';

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
  const outingId = Number(useParams().outingId);
  const { outing, profiles } = useLoaderData();

  const { getOuting } = outing.data;
  const { getProfilesInOuting } = profiles.data;

  const [
    SendEmail,
    { loading: emailLoading, error: emailError, data: emailData },
  ] = useMutation(SEND_OUTING_EMAIL);

  if (emailError) {
    logApolloError(emailError);
    // don't throw an error here, because if the email fails to send we can still show the outing details
  }

  return (
    <div>
      {getOuting ? (
        <>
          <h1>{getOuting.name}</h1>
          <p>{getOuting.start_date_and_time}</p>
          <p>{getOuting.place_ids}</p>
          <br />
          <div className="add-profiles">
            <form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const emails =
                  e.currentTarget['profile-email'].value.split(',');
                console.log(emails);
                // const trimmedEmails = emails.map((email: string) => email.trim());
                // console.log(trimmedEmails);

                // TODO: add validation to make sure emails are valid

                SendEmail({
                  variables: {
                    outing_id: outingId,
                    start_date_and_time: getOuting.start_date_and_time,
                    emails,
                  },
                });
                e.currentTarget['profile-email'].value = '';
              }}
            >
              <label htmlFor="profile-email">Send invitation email to: </label>
              <input
                type="email"
                name="profile-email"
                id="profile-email"
                // TODO figure out why this regex is causing 'garay.logan+test1@gmail.com' to fail in the app, but passes at https://regexr.com
                // pattern={`${VALID_EMAIL_REGEX}`}
                title="figure out what pattern(s) to show here"
              />
              <button type="submit">Send Invite</button>
            </form>
          </div>
          <h4>Profiles in Outing</h4>
          {getProfilesInOuting ? (
            <>
              {getProfilesInOuting.map((profile: any) => {
                return (
                  <div key={profile.id}>
                    <p>
                      {profile.name} with id {profile.id}
                    </p>
                  </div>
                );
              })}
            </>
          ) : (
            <p>No one yet!</p>
          )}
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
