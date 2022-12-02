import { authenticator } from '~/auth/authenticator';
import { getSession } from '~/auth/session';

export const validateUserAndSession = async (request: any) => {
  // Check if the user is 'logged in' according to remix-auth
  const user = await authenticator.isAuthenticated(request);
  // console.log('USER', user);

  // Check if the user has an active Remix session
  const session = await getSession(request.headers.get('Cookie'));
  // console.log('SESSION', session.data);

  // TODO run token validation here too

  if (user && session.has('user')) {
    return { valid: true };
  } else {
    return { valid: false };
  }
};
