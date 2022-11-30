import { redirect } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { Auth0Strategy } from 'remix-auth-auth0';
import getConfig from '~/utils/config.server';
import type { Auth0User } from '../types/sharedTypes';
import { getSession, destroySession, sessionStorage } from './session';

const config = getConfig();

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export const authenticator = new Authenticator<Auth0User | null>(
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
    // NOTE I don't believe we can/should do this user fetching here
    // at this point we should only get and set the authData in session
    // that way we can then fetch that data throughout the rest of the app
    // then on the homepage we can use the authenticator.isAuthenticated() method to check to see if there is a 'user'/authData set
    // if NOT then we can redirect them back to the landing page as that would indicate something went wrong
    // if the data IS SET then we can use that idToken to then create the apollo client

    // const response = await fetch(`${config.SERVER.ADDRESS}/authenticate`, {
    //   headers: {
    //     Authorization: `Bearer ${idToken}`,
    //   },
    // });
    // if (response.status === 403) return null;
    // const userData = await response.json();
    // console.log(userData);

    return { ...authData };
  }
);

authenticator.use(auth0Strategy);

// Helper methods
const getLogoutUrl = () => {
  const config = getConfig();

  const logoutURL = new URL(config.AUTH0.LOGOUT_URL);
  logoutURL.searchParams.set('client_id', config.AUTH0.CLIENT_ID);
  logoutURL.searchParams.set('returnTo', config.AUTH0.RETURN_TO_URL);

  return logoutURL.toString();
};

// NOTE can't type the request as 'Request' because in the logout.tsx resource route, when passing in the request from the action
// It produces an error saying "Argument of type 'Request' is not assignable to parameter of type 'NodeRequest'."
export const logout = async (request: any) => {
  const session = await getSession(request.headers.get('Cookie'));
  const url = getLogoutUrl();

  return redirect(url, {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
};
