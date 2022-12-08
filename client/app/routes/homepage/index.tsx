import type { LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { logout } from '~/auth/authenticator';
import { useQuery, gql } from '@apollo/client';
import { validateUserAndSession } from '~/utils/validateUserAndSession';

const testQuery = gql`
  query accounts {
    accounts {
      email
      email_verified
    }
  }
`;

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
  if (error) return <h1>Error: {error.message}</h1>;

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
          <button>Logout</button>
        </Form>
      </main>
    </>
  );
}
