import { redirect } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { Auth0Strategy } from 'remix-auth-auth0';
import getConfig from '~/utils/config.server';
import type { User } from '../types/sharedTypes';
import { getSession, destroySession, sessionStorage } from './session';

const config = getConfig();

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export const authenticator = new Authenticator<User | null>(sessionStorage);

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
    const token = authData.extraParams.id_token;
    const response = await fetch(`${config.SERVER.ADDRESS}/authenticate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // NOTE it seems if the authenticator callback itself returns null, the authenticator can't be used (which makes sense I guess)
    // However, this then leads to potentiall issues where there is a legitimate error in which no user can be fetched/found
    // And so then how do we want to handle those situations?
    // Having the authenticator just not work doesn't seem like the right choice
    // HOWEVER, it seems that if userData === null yet we still return 'something' from the callback...things still 'work'
    // As in, the authenticator just invalidates the user and in will redirect them to wherever is configured in the .authenticate() method
    if (response.status === 400 || response.status === 500) return null;

    const userData = await response.json();

    return { info: { ...userData }, token };
  }
);

authenticator.use(auth0Strategy);

// Helper methods
const getLogoutUrl = (returnToLoginPage?: boolean) => {
  const config = getConfig();

  const logoutURL = new URL(config.AUTH0.LOGOUT_URL);
  logoutURL.searchParams.set('client_id', config.AUTH0.CLIENT_ID);

  const returnToURL = returnToLoginPage
    ? config.AUTH0.LOGIN_PAGE
    : config.AUTH0.RETURN_TO_URL;
  logoutURL.searchParams.set('returnTo', returnToURL);

  return logoutURL.toString();
};

// NOTE can't type the request as 'Request' because in the logout.tsx resource route, when passing in the request from the action
// It produces an error saying "Argument of type 'Request' is not assignable to parameter of type 'NodeRequest'."

/**
 * @desc Use this to handle both logging the user out of their Auth0 account and clearing their Remix session
 * @param request the standard request object from either the loader or action
 * @param returnToLoginPage Pass a truthy value to have the user redirected straight to the login page. Default is the Landing page
 * @returns a Remix redirect, not actual data.
 */
export const logout = async (request: any, returnToLoginPage?: boolean) => {
  const session = await getSession(request.headers.get('Cookie'));
  const url = getLogoutUrl(returnToLoginPage);

  return redirect(url, {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
};
