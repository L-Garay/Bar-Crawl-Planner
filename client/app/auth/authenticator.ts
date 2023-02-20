import type { TypedResponse } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { Auth0Strategy } from 'remix-auth-auth0';
import getConfig from '~/utils/config.server';
import type { AuthenticatorUser } from '../types/sharedTypes';
import { getSession, destroySession, sessionStorage } from './session';

const config = getConfig();

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export const authenticator = new Authenticator<AuthenticatorUser | null>(
  sessionStorage
);

let auth0Strategy = new Auth0Strategy(
  {
    callbackURL: config.AUTH0.CALLBACK_URL,
    clientID: config.AUTH0.CLIENT_ID,
    clientSecret: config.AUTH0.CLIENT_SECRET,
    domain: config.AUTH0.DOMAIN,
    audience: config.AUTH0.AUDIENCE,
  },
  // Sets the token header
  async (authData) => {
    // NOTE pay attention to any missed downstream errors after including the entire authData object instead of the
    const idToken = authData.extraParams.id_token;

    // NOTE may have to take out the profile and account creation from this route
    // may need to make it a separate call from an action and not this callback
    // once this callback resolves in the action we'll know that we can fire off the other call to check for a profile and account and create them if needed
    const response = await fetch(`${config.SERVER.ADDRESS}/authenticate`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (response.status === 400 || response.status === 500) return null;

    return { authData };
  }
);

authenticator.use(auth0Strategy);

// Helper methods
const getLogoutUrl = (returnToLoginPage?: boolean): string => {
  const config = getConfig();

  const logoutURL = new URL(config.AUTH0.LOGOUT_URL);
  logoutURL.searchParams.set('client_id', config.AUTH0.CLIENT_ID);

  const returnToURL = returnToLoginPage
    ? config.AUTH0.LOGIN_PAGE
    : config.AUTH0.RETURN_TO_URL;
  logoutURL.searchParams.set('returnTo', returnToURL);

  return logoutURL.toString();
};

/**
 * @desc Use this to handle both logging the user out of their Auth0 account and clearing their Remix session
 * @param request the standard request object from either the loader or action
 * @param returnToLoginPage Pass a truthy value to have the user redirected straight to the login page. Default is the Landing page
 * @returns a Remix redirect, not actual data.
 */
export const logout = async (
  request: Request,
  returnToLoginPage?: boolean
): Promise<TypedResponse<never>> => {
  const session = await getSession(request.headers.get('Cookie'));
  const url = getLogoutUrl(returnToLoginPage);

  return redirect(url, {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
};
