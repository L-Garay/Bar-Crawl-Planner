import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { logout } from '~/auth/authenticator';
import { BasicFooter } from '~/components/organisms/Footers';
import { BasicHeader } from '~/components/organisms/Headers';
import { validateUserAndSession } from '~/utils/validateUserAndSession';
import footerStyles from '~/generatedStyles/footer.css';
import headerStyles from '~/generatedStyles/header.css';
import { getNewClient } from '~/apollo/getClient';
import { GET_NEW_NOTIFICATIONS_COUNT } from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';

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
  const client = await getNewClient(request);

  if (valid) {
    try {
      const count = await client.query({
        query: GET_NEW_NOTIFICATIONS_COUNT,
      });
      return { session, user, valid, count };
    } catch (error) {
      logApolloError(error);
      return { session, user, valid, count: 0 };
      // NOTE do we want to throw anything here and trigger an error boundary?
    }
  } else {
    return logout(request, true);
  }
};

// NOTE we can use the loader here to load notifications for the user
// then pass them down as props to the header component (to display the notification count for exmaple)
export default function AuthLayout() {
  const { count } = useLoaderData();
  const notificationsCount = count.data.getNewNotificationCount;

  return (
    <>
      <BasicHeader notificationsCount={notificationsCount} />
      <Outlet />
      <BasicFooter />
    </>
  );
}

// Don't believe I should need an Error or Catch boundary here, as the only way to get to this route is to be authenticated
// If there's an error between when the user logs in and then they try to access a protected route, we know something really bad happened
// in which case logging them out should work, and then if the issue persists it should get caught by the root/login pages' error and catch boundaries
