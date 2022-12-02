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
    // NOTE actually we will want to fetch the user here and set it, BUT we'll also still need to pass along the idToken so we can still create the apollo client
    const token = authData.extraParams.id_token;
    const response = await fetch(`${config.SERVER.ADDRESS}/authenticate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 400 || response.status === 500) return null;

    const userData = await response.json();

    return { info: { ...userData }, token };
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
