import { ApolloClient, ApolloProvider } from '@apollo/client';
import type { LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import useGetApolloClient from '~/apollo/getClient';
import { logout } from '~/auth/authenticator';
import getConfig from '~/utils/config.server';
import { validateUserAndSession } from '~/utils/validateUserAndSession';

// Having this pathless auth layout route handle user validation will protect all of it's child routes from unauthenticated users
export const loader: LoaderFunction = async ({ request }) => {
  const config = getConfig();
  const { valid, user, session } = await validateUserAndSession(request);

  if (valid) {
    return { session, user, valid, config };
  } else {
    return logout(request, true);
  }
};

export default function AuthLayout() {
  const loaderData = useLoaderData();
  const { config, user } = loaderData;
  const getClient = useGetApolloClient(
    config.SERVER.ADDRESS,
    user.authData.extraParams.id_token
  );
  const client = getClient() as ApolloClient<any>;
  return (
    <ApolloProvider client={client}>
      <Outlet />
    </ApolloProvider>
  );
}

// Don't believe I should need an Error or Catch boundary here, as the only way to get to this route is to be authenticated
// If there's an error between when the user logs in and then they try to access a protected route, we know something really bad happened
// in which case logging them out should work, and then if the issue persists it should get caught by the root/login pages' error and catch boundaries
