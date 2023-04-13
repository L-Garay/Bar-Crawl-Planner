// export const loader: LoaderFunction = async ({ request }) => {};

import { useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  GET_PENDING_OUTINGS,
  GET_PROFILE_ID,
} from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';
import OutingInvite from '~/components/outings/outingInvite';

export default function OutingInvites() {
  const [pendingOutings, setPendingOutings] = useState<any[]>([]);
  const [outingCreatorProfiles, setOutingCreatorProfiles] = useState<any[]>([]);
  const [profileId, setProfileId] = useState<number>(0);
  const { data: pendingData, error: pendingError } = useQuery(
    GET_PENDING_OUTINGS,
    {
      onError: (error) => {
        logApolloError(error);
      },
      onCompleted: (data) => {
        console.log('pendingData', data);
        setPendingOutings(data.getPendingOutings.pending_outings);
        setOutingCreatorProfiles(
          data.getPendingOutings.outing_creator_profiles
        );
      },
    }
  );
  useQuery(GET_PROFILE_ID, {
    onCompleted: (data) => setProfileId(data.getProfile.id),
  });
  console.log(
    'pendingOutings',
    pendingOutings,
    'outingCreatorProfiles',
    outingCreatorProfiles,
    'profileId',
    profileId
  );

  return (
    <div>
      <h1>Outing Invites</h1>
      {pendingOutings.length ? (
        <>
          {pendingOutings.map((outing, index) => {
            const outingCreatorProfile = outingCreatorProfiles[index];
            return (
              <OutingInvite
                key={outing.id}
                creatorName={outingCreatorProfile.name}
                outingName={outing.name}
                startDateAndTime={outing.start_date_and_time}
                outingId={outing.id}
                profileId={profileId}
              />
            );
          })}
        </>
      ) : (
        <p>No pending outings</p>
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: { error: any }) {
  return (
    <main>
      <div className="error-container">
        <h1>
          Uh-oh looks like someone forgot to tell your outings they worked today
        </h1>
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
        <h1>
          Uh-oh looks like someone forgot to tell your outings they worked today
        </h1>
        <p>
          Please try again later, and if the issue still persists contact
          customer support
        </p>
        <small>Call (208) 999-8888 or email test@mail.com</small>
      </div>
    </main>
  );
}
