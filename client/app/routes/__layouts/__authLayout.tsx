import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { logout } from '~/auth/authenticator';
import { BasicFooter } from '~/components/organisms/Footers';
import { BasicHeader } from '~/components/organisms/Headers';
import { validateUserAndSession } from '~/utils/validateUserAndSession';
import footerStyles from '~/generatedStyles/footer.css';
import headerStyles from '~/generatedStyles/header.css';
import { GET_NEW_NOTIFICATIONS_COUNT } from '~/constants/graphqlConstants';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: headerStyles,
      as: 'style',
    },
    {
      rel: 'stylesheet',
      href: footerStyles,
      as: 'style',
    },
  ];
};

// Having this pathless auth layout route handle user validation will protect all of it's child routes from unauthenticated users
export const loader: LoaderFunction = async ({ request }) => {
  const { valid, user, session } = await validateUserAndSession(request);

  if (!valid) {
    return logout(request, true);
  }

  return { session, user, valid };
};

export default function AuthLayout() {
  const {
    data: countData,
    loading: countLoading,
    error: countError,
  } = useQuery(GET_NEW_NOTIFICATIONS_COUNT);

  const count = useMemo(() => {
    if (!countData || !countData.getNewNotificationCount) return 0;
    return countData.getNewNotificationCount;
  }, [countData]);

  return (
    <>
      <BasicHeader count={count} />
      <Outlet />
      <BasicFooter />
    </>
  );
}

// Don't believe I should need an Error or Catch boundary here, as the only way to get to this route is to be authenticated
// If there's an error between when the user logs in and then they try to access a protected route, we know something really bad happened
// in which case logging them out should work, and then if the issue persists it should get caught by the root/login pages' error and catch boundaries
