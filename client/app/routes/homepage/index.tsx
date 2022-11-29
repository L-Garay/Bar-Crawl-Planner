import type { LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { authenticator } from '~/auth/authenticator';
import { getSession } from '~/auth/session';

export const loader: LoaderFunction = async ({ request }) => {
  const isAuthenticated = await authenticator.isAuthenticated(request);
  console.log('isAuthenticated from loader on homepage', isAuthenticated);

  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);
  return { session };
};

export default function HomePage() {
  const { session } = useLoaderData();
  console.log('Session', session);

  return (
    <>
      <main>
        <h1>This is the Home Page</h1>
        <p>
          This is the page users will land when they have logged, they've been
          authenticated and a user session has been created for them
        </p>
        <Form method="post" action="/resources/logout">
          <button>Logout</button>
        </Form>
      </main>
    </>
  );
}
