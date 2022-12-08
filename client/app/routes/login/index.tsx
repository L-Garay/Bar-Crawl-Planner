import { Form } from '@remix-run/react';
import getConfig from '~/utils/config.server';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth/authenticator';
import { validateUserAndSession } from '~/utils/validateUserAndSession';

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate('auth0', request);
};

export const loader: LoaderFunction = async ({ request }) => {
  const config = getConfig();
  const { valid } = await validateUserAndSession(request);

  if (valid) {
    return redirect(config.AUTH0.LOGIN_URL);
  } else {
    return null;
  }
};

export default function LoginPage() {
  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>Please log in to continue</h1>
        <Form method="post">
          <button>Login or Sign up</button>
        </Form>
      </div>
    </>
  );
}
