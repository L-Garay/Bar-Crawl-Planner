import type { LoaderFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { logout } from '~/auth/authenticator';
import { validateUserAndSession } from '~/utils/validateUserAndSession';

// NOTE having this pathless auth layout route handle user validation will protect all of it's child routes from unauthenticated users
export const loader: LoaderFunction = async ({ request }) => {
  const { valid, user, session } = await validateUserAndSession(request);
  console.log(valid);

  if (valid) {
    return { session, user, valid };
  } else {
    return logout(request, true);
  }
};

export default function AuthLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
