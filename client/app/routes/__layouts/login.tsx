import { Form } from '@remix-run/react';
import getConfig from '~/utils/config.server';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth/authenticator';
import { validateUserAndSession } from '~/utils/validateUserAndSession';
import fs from 'fs';

export const action: ActionFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const profileId = url.searchParams.get('profileId');
  const outingId = url.searchParams.get('outingId');
  const returnTo = url.searchParams.get('returnTo');
  const data = {
    returnTo,
    profileId,
    outingId,
  };
  // NOTE this is temporary until we can log in - get redirected to outing page - then delete file
  // TODO change this
  try {
    fs.unlinkSync('/tmp/barcrawl');
  } catch (error) {
    console.log('Error deleting file', error);
  }
  if (profileId != null && returnTo != null) {
    try {
      fs.writeFileSync('/tmp/barcrawl', JSON.stringify(data));
    } catch (error) {
      console.log('Error writing to file', error);
    }
  }

  return authenticator.authenticate('auth0', request);
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const config = getConfig();
  const { valid } = await validateUserAndSession(request);
  const url = new URL(request.url);
  // NOTE each resource page or other, will be responsible for setting the proper returnTo value in the url parameters when redirecting to login page
  const returnTo = url.searchParams.get('returnTo');

  // if valid and has returnTo, redirect the returnTo url
  if (valid && returnTo) {
    return redirect(returnTo);
  } else if (valid && !returnTo) {
    // else if valid and no returnTo, redirect to homepage (normal flow)
    return redirect(config.AUTH0.LOGIN_URL);
  } else {
    // else if not valid and but DOES have a returnTo, leave them on this page to login normally, action will handle writing data to file for use in callback to rediret
    // not valid and no returnTo, leave them on this page and have them continue normal flow, action will not write data to file so callback will function normally
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
