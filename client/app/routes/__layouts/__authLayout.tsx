import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import { logout } from '~/auth/authenticator';
import { BasicFooter } from '~/components/organisms/Footers';
import { BasicHeader } from '~/components/organisms/Headers';
import { validateUserAndSession } from '~/utils/validateUserAndSession';
import footerStyles from '~/generatedStyles/footer.css';
import headerStyles from '~/generatedStyles/header.css';
import { GET_NEW_NOTIFICATIONS_COUNT } from '~/constants/graphqlConstants';
import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';

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

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo');

  if (!valid && redirectTo) {
    return { redirectTo, valid };
  } else if (!valid && !redirectTo) {
    return logout(request, true);
  }

  return { session, user, valid };
};

export default function AuthLayout() {
  const { redirectTo, valid } = useLoaderData();
  const navigate = useNavigate();

  // If a user is ever linked to a page that is wrapped in this authLayout route and they are not logged in when they click the link, they will all get caugh by the loader function above
  // They wont' have a valid session, and if we pull off a redirectTo param then we know they were trying to access a protected route
  // so we need to store the redirectTo param in local storage so that when they log in, we can redirect them to the page they were trying to access
  // in order to do that we need access to the DOM and therefore need to pass the redirectTo value from the loader to the rendered component so we have access to window
  // then we save the value in local storage, and navigate user to logout route
  useEffect(() => {
    if (redirectTo) {
      window.localStorage.setItem('redirectTo', redirectTo);
      const url = `/resources/logout?returnToLogin=true`;
      navigate(url);
    }
  }, [redirectTo, navigate]);

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
      {valid ? (
        <>
          <BasicHeader count={count} />
          <Outlet />
          <BasicFooter />
        </>
      ) : null}
    </>
  );
}

// Don't believe I should need an Error or Catch boundary here, as the only way to get to this route is to be authenticated
// If there's an error between when the user logs in and then they try to access a protected route, we know something really bad happened
// in which case logging them out should work, and then if the issue persists it should get caught by the root/login pages' error and catch boundaries
