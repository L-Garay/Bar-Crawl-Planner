import type { LinksFunction } from '@remix-run/node';
import { useQuery, gql } from '@apollo/client';
import homepageStyles from '../../../generatedStyles/homepage.css';
import spinnerStyles from '../../../generatedStyles/spinners.css';
import { Dynamic } from '~/components/animated/loadingSpinners';
import { useIsDomLoaded } from '~/utils/useIsDomLoaded';
import logApolloError from '~/utils/getApolloError';

const testQuery = gql`
  query accounts {
    accounts {
      email
      email_verified
    }
  }
`;

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: homepageStyles,
      as: 'style',
    },
    {
      rel: 'stylesheet',
      href: spinnerStyles,
      as: 'style',
    },
  ];
};

export default function HomePage() {
  const isDomLoaded = useIsDomLoaded();

  const { loading, error, data } = useQuery(testQuery);

  if (loading) {
    return <Dynamic />;
  }
  if (error) {
    logApolloError(error);
    throw new Error(JSON.stringify(error));
  }

  return (
    <main>
      {isDomLoaded ? (
        <>
          <h1>This is the Home Page</h1>
          <p>
            This is the page users will land when they have logged, they've been
            authenticated and a user session has been created for them
          </p>
          <small>Data from grapqhl query</small>
          <small>{JSON.stringify(data)}</small>
        </>
      ) : null}
    </main>
  );
}

// TODO look into why even though I have this error boundary, when I throw an error from the component, in the console it still says 'Uncaught error...'
// does it always log that?
// does it get logged before it gets caught by the error boundary?
// or am I missing something about using Error boundaries?
export function ErrorBoundary({ error }: { error: any }) {
  return (
    <main>
      <div className="error-container">
        <h1>
          Uh-oh looks like someone spilled their drink again here at the office
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
          Uh-oh looks like someone spilled their drink again here at the office
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
