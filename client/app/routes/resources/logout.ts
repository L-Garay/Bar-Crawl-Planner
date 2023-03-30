import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { logout } from '~/auth/authenticator';

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const returnToLogin = url.searchParams.get('returnToLogin') === 'true';
  return logout(request, returnToLogin);
};
