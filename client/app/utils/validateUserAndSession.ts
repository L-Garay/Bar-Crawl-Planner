import { authenticator } from '~/auth/authenticator';
import { getSession } from '~/auth/session';
import getConfig from './config.server';

const config = getConfig();

/**
 * @desc This method will attempt to authenticate the user using Auth0, verify that there is a valid Remix session and then attempt to validate the id_token set/recieved from Auth0.
 * @param request the standard request object from either the loader or action.
 * @returns On success it will return a boolean value indicating if things are valid, along with the user and session data. On failure, it will just return the boolean value.
 */
export const validateUserAndSession = async (request: any) => {
  // Check if the user is 'logged in' according to remix-auth
  const user = await authenticator.isAuthenticated(request);

  // Check if the user has an active Remix session
  const session = await getSession(request.headers.get('Cookie'));

  // Run token validation
  const data = await fetch(`${config.SERVER.ADDRESS}/validate`, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  const isTokenValid: boolean = await data.json();

  const valid = Boolean(user) && Boolean(session.has('user')) && isTokenValid;

  if (valid) {
    return { valid: true, user, session };
  } else {
    return { valid: false };
  }
};
