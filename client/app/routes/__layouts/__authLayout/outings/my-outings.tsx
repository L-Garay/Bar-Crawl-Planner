import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { getNewClient } from '~/apollo/getClient';
import { GET_OUTINGS } from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';

export const loader: LoaderFunction = async ({ request }) => {
  const client = await getNewClient(request);
  let outings: any;
  try {
    outings = await client.query({
      query: GET_OUTINGS,
    });
  } catch (error) {
    logApolloError(error);
    throw new Response(JSON.stringify(error), { status: 500 });
  }
  return outings;
};

export default function MyOutings() {
  const navigate = useNavigate();
  const loaderData = useLoaderData();

  const { getAllOutings } = loaderData.data;

  return (
    <div>
      <h1>My Outings</h1>
      {getAllOutings.length === 0 ? (
        <p>No outings yet</p>
      ) : (
        <>
          {getAllOutings.map((outing: any) => {
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
        </>
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
