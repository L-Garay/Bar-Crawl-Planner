import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { logout } from '~/auth/authenticator';

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export const loader: LoaderFunction = async ({ request }) => {
  return logout(request);
};
