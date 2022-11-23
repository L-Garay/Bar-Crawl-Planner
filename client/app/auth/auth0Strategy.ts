import { Authenticator } from 'remix-auth';
import { Auth0Strategy } from 'remix-auth-auth0';
import { User } from '../types/sharedTypes';
import {
  getSession,
  commitSession,
  destroySession,
  sessionStorage,
} from './session';

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export const authenticator = new Authenticator<User>(sessionStorage);

let auth0Strategy = new Auth0Strategy(
  {
    callbackURL: window.ENV.AUTH0.CALLBACK_URL,
    clientID: window.ENV.AUTH0.CLIENT_ID,
    clientSecret: window.ENV.AUTH0.CLIENT_SECRET,
    domain: window.ENV.AUTH0.DOMAIN,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    return User.findOrCreate({ email: profile.emails[0].value });
  }
);

authenticator.use(auth0Strategy);
