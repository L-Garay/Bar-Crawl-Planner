import { Form } from '@remix-run/react';
import getConfig from '~/utils/config.server';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth/authenticator';
import { validateUserAndSession } from '~/utils/validateUserAndSession';
import fs from 'fs';
import { useEffect, useState } from 'react';

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

  // we need to check the visitor's against those values in the database
  // if they match, we know this visitor is the one who was invited
  // which means we can connect them to the account, profile (the profile will have already been added to the outing)
  // they'll still need to go through the auth flow and register their identity with Auth0 however
  // NOTE this raises the potential issue of someone registering an identity with a different email address than the one they were invited with and that is currently stored on their pre-made account in the DB
  // TODO take the invite account data that was submitted by the form and add it to the authenticator context
  return authenticator.authenticate('auth0', request, {
    context: {},
  });
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
  const [accountData, setAccountData] = useState<Record<string, string>>({});

  useEffect(() => {
    // TODO get the invite account data from local storage and set it to state
    // then we'll need to attach it to the action function call from the button
    // most likely we'll need to tie the accountData to a hidden input that is submitted by the Form
  }, [window]);

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
