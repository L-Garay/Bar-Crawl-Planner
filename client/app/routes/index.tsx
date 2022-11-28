import React from 'react';
import { Form, Link } from '@remix-run/react';
import useAuthContext from '~/contexts/authContext';
import getConfig from '~/utils/config.server';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth/authenticator';

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate('auth0', request);
};

export const loader: LoaderFunction = async ({ request }) => {
  const config = getConfig();
  const user = await authenticator.isAuthenticated(request);
  console.log('User from main page loader', user);
  if (user) {
    return redirect(config.AUTH0.LOGIN_URL);
  } else return { foo: 'bar' };
};

export default function LandingPage() {
  const { authClient } = useAuthContext();

  return (
    <>
      {authClient && (
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            lineHeight: '1.4',
          }}
        >
          <h1>Welcome to Remix</h1>
          <Link to="/test">Test Link</Link>
          <Form method="post">
            <button>Login</button>
          </Form>
        </div>
      )}
    </>
  );
}
