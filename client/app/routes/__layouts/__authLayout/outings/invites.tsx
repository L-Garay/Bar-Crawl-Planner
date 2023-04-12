// export const loader: LoaderFunction = async ({ request }) => {};

import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { GET_PENDING_OUTINGS } from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';

export default function OutingInvites() {
  const [pendingOutings, setPendingOutings] = useState<any[]>([]);
  const [outingCreatorProfiles, setOutingCreatorProfiles] = useState<any[]>([]);
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
  console.log(
    'pendingOutings',
    pendingOutings,
    'outingCreatorProfiles',
    outingCreatorProfiles
  );

  return (
    <div>
      <h1>Outing Invites</h1>
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
