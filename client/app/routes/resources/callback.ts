import type { LoaderFunction } from '@remix-run/node';
import { authenticator, logout } from '~/auth/authenticator';
import { commitSession, getSession } from '~/auth/session';

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const session = await getSession(request.headers.get('Cookie'));

  if (state === null || !session) {
    logout(request, true);
  }

  // NOTE for some reason, when testing the auth flow in Cypress, the state param is not being set in the Remix session before the .authenticate() call is made
  // and it causes the flow to stall (for some reason it doesn't trigger the failureRedirect)
  // so we need to check to see if that session data is present, and if not we need to manually set it ourselves
  if (session && session.has('oauth2:state') === false) {
    console.log('should be setting state in session', state);
    session.set('oauth2:state', state);
    const newHeaders = {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    };
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Cookie', newHeaders.headers['Set-Cookie']);
    const clonedRequest = new Request(request, {
      headers: requestHeaders,
    });
    return await authenticator.authenticate('auth0', clonedRequest, {
      successRedirect: '/check-user',
      failureRedirect: '/',
      context,
    });
  }

  return await authenticator.authenticate('auth0', request, {
    successRedirect: '/check-user',
    failureRedirect: '/',
    context,
  });
};
