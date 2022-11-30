import type { LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { authenticator } from '~/auth/authenticator';
import { getSession } from '~/auth/session';
import { useQuery, gql } from '@apollo/client';

const testQuery = gql`
  query accounts {
    accounts {
      email
      email_verified
    }
  }
`;

export const loader: LoaderFunction = async ({ request }) => {
  const authData = await authenticator.isAuthenticated(request);

  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);

  return { session, authData };
};

export default function HomePage() {
  const { authData } = useLoaderData();
  console.log(authData, 'from homepage');

  const { loading, error, data } = useQuery(testQuery);

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>Error: {error.message}</h1>;

  return (
    <>
      <main>
        <h1>This is the Home Page</h1>
        <p>
          This is the page users will land when they have logged, they've been
          authenticated and a user session has been created for them
        </p>
        <small>{JSON.stringify(data)}</small>
        <Form method="post" action="/resources/logout">
          <button>Logout</button>
        </Form>
      </main>
    </>
  );
}
