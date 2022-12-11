import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { logout } from '~/auth/authenticator';
import { useQuery, gql } from '@apollo/client';
import { validateUserAndSession } from '~/utils/validateUserAndSession';
import styles from '../../generatedStyles/homePage.css';

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
      href: styles,
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const { valid, user, session } = await validateUserAndSession(request);

  if (valid) {
    return { session, user, valid };
  } else {
    return logout(request, true);
  }
};

export default function HomePage() {
  const { user } = useLoaderData();

  const { loading, error, data } = useQuery(testQuery);

  if (loading) return <h1>Loading...</h1>;
  if (error) throw error;

  return (
    <>
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
    </>
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
