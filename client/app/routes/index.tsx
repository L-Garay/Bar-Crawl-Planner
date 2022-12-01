import React from 'react';
import { Form, Link } from '@remix-run/react';
import getConfig from '~/utils/config.server';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth/authenticator';

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate('auth0', request);
};

// IF they are logged in with NO/Invalid token then hard log them out/clear sessions etc
export const loader: LoaderFunction = async ({ request }) => {
  // NOTE I'm not sure if this will ever allow a user to just sit on this page, or if it will always either have them log in or redirect themt to homepage
  // return authenticator.authenticate('auth0', request);

  const config = getConfig();
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    return redirect(config.AUTH0.LOGIN_URL);
  } else {
    return { noUser: true };
  }
};

export default function LandingPage() {
  return (
    <>
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
    </>
  );
}
