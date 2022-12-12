import type { ActionFunction } from '@remix-run/node';
import { logout } from '~/auth/authenticator';

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};
