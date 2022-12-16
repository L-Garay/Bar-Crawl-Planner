import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { authenticator } from '~/auth/authenticator';
import { useQuery, gql } from '@apollo/client';
import homepageStyles from '../../../generatedStyles/homepage.css';
import spinnerStyles from '../../../generatedStyles/spinners.css';
import { Dynamic } from '~/components/animated/loadingSpinners';

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
    },
    {
      rel: 'stylesheet',
      href: spinnerStyles,
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  return { user };
};

export default function HomePage() {
  const { user } = useLoaderData();

  const { loading, error, data } = useQuery(testQuery);

  if (loading) {
    return <Dynamic />;
  }
  if (error) throw error;

  return (
    <main>
      <h1>This is the Home Page</h1>
      <h3>Welcome {user.info.name}</h3>
      <h4>{user.info.email}</h4>
      <p>
        This is the page users will land when they have logged, they've been
        authenticated and a user session has been created for them
      </p>
      <small>Data from grapqhl query</small>
      <small>{JSON.stringify(data)}</small>
      <Form method="post" action="/resources/logout">
        <button className="test-button">Logout</button>
      </Form>
    </main>
  );
}

// TODO properly think about and update this
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <main>
      <h1>Home Page error</h1>
      <p>{error.message}</p>
    </main>
  );
}
