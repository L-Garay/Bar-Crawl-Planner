import type { LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/auth/authenticator';

export const loader: LoaderFunction = async ({ request, context }) => {
  return await authenticator.authenticate('auth0', request, {
    successRedirect: '/homepage',
    failureRedirect: '/',
    context,
  });
};
