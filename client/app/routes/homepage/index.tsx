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
  // NOTE do we need to add in a failureRedirect here?

  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);

  return { session, authData };
};

export default function HomePage() {
  const { authData } = useLoaderData();

  // NOTE will need to implement token check on root/index page before uncommenting this, as old tokens will get used to create apollo client which will then lead to auth errors
  // May need to redirect back to the root/landing page from the loader above
  const { loading, error, data } = useQuery(testQuery);

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>Error: {error.message}</h1>;

  return (
    <>
      <main>
        <h1>This is the Home Page</h1>
        <h3>Welcome {authData.info.name}</h3>
        <h4>{authData.info.email}</h4>
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
