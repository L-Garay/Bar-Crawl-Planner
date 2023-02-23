import { gql, useQuery } from '@apollo/client';
import { useNavigate } from '@remix-run/react';
import { Dynamic } from '~/components/animated/loadingSpinners';
import logApolloError from '~/utils/getApolloError';

const GET_OUTINGS = gql`
  query getAllOutings {
    getAllOutings {
      id
      name
      creator_profile_id
      created_at
      start_date_and_time
      place_ids
    }
  }
`;

export default function MyOutings() {
  const { loading, error, data } = useQuery(GET_OUTINGS);
  const navigate = useNavigate();

  if (loading) {
    return <Dynamic />;
  }
  if (error) {
    logApolloError(error);
    throw error;
  }

  return (
    <div>
      <h1>My Outings</h1>
      {data.getAllOutings.map((outing: any) => {
        return (
          <div
            key={outing.id}
            style={{ display: 'flex' }}
            onClick={() => navigate(`/outings/my-outings/${outing.id}`)}
          >
            <p style={{ paddingRight: 10 }}>{outing.name}</p>
            <p>{outing.start_date_and_time}</p>
          </div>
        );
      })}
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
