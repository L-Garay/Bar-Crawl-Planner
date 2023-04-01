import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useMemo } from 'react';
import { getNewClient } from '~/apollo/getClient';
import { GET_CREATED_AND_JOINED_OUTINGS } from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';

export const loader: LoaderFunction = async ({ request }) => {
  const client = await getNewClient(request);
  let outings: any;
  try {
    outings = await client.query({
      query: GET_CREATED_AND_JOINED_OUTINGS,
    });
  } catch (error) {
    logApolloError(error);
    throw new Response(JSON.stringify(error), { status: 500 });
  }
  const { getCreatedOutings, getJoinedOutings } = outings.data;

  return { getCreatedOutings, getJoinedOutings };
};

export default function MyOutings() {
  const navigate = useNavigate();
  const loaderData = useLoaderData();

  const { getCreatedOutings, getJoinedOutings } = loaderData;

  const noOutings = useMemo(() => {
    if (getCreatedOutings.length === 0 && getJoinedOutings.length === 0) {
      return true;
    } else {
      return false;
    }
  }, [getCreatedOutings, getJoinedOutings]);

  return (
    <div>
      <h1>My Outings</h1>
      {noOutings ? (
        <p>No outings yet</p>
      ) : (
        <div className="outing-tables" style={{ display: 'flex' }}>
          <div className="created-outings" style={{ minWidth: 300 }}>
            <h4>Created</h4>
            <>
              {getCreatedOutings.length === 0 ? (
                <div style={{ display: 'flex' }}>
                  <p>You have not created any yet</p>
                </div>
              ) : (
                <>
                  {getCreatedOutings.map((outing: any) => {
                    return (
                      <div
                        key={outing.id}
                        style={{
                          display: 'flex',
                          cursor: 'pointer',
                          marginRight: 20,
                        }}
                        onClick={() =>
                          navigate(`/outings/my-outings/${outing.id}`)
                        }
                      >
                        <p style={{ paddingRight: 10 }}>{outing.name}</p>
                        <p>{outing.start_date_and_time}</p>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          </div>
          <div className="joined-outings" style={{ minWidth: 300 }}>
            <h4>Joined</h4>
            {getJoinedOutings.map((outing: any) => {
              return (
                <div
                  key={outing.id}
                  style={{ display: 'flex', cursor: 'pointer' }}
                  onClick={() => navigate(`/outings/my-outings/${outing.id}`)}
                >
                  <p style={{ paddingRight: 10 }}>{outing.name}</p>
                  <p>{outing.start_date_and_time}</p>
                </div>
              );
            })}
          </div>
        </div>
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
