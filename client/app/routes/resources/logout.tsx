import type { ActionFunction } from '@remix-run/node';
import { logout } from '~/auth/authenticator';

export const action: ActionFunction = async ({ request }) => {
  // WTF is a 'NodeRequest'?
  // Error when the logout function types the request object as 'Request'
  //"Argument of type 'Request' is not assignable to parameter of type 'NodeRequest'."
  return logout(request);
};
