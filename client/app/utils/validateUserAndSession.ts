import { authenticator } from '~/auth/authenticator';
import { getSession } from '~/auth/session';
import getConfig from './config.server';

const config = getConfig();

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
