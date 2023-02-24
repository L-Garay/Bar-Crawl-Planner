import { ApolloClient, InMemoryCache } from '@apollo/client';
import React from 'react';
import { getSession } from '~/auth/session';
import getConfig from '~/utils/config.server';

// NOTE I believe the way this is configured and implemented, each time a user accesses the site, they will get just one instance of the client
// each different user will get a different instance of the client, since the client is created based on the idToken
// See this discussion where Apollo dev says that it's not required to create a new client for each request https://github.com/apollographql/apollo-client/issues/9520
const useGetApolloClient = (serverAddress: string, idToken?: string) => {
  const callback = React.useCallback(() => {
    return new ApolloClient({
      uri: `${serverAddress}/graphql`,
      cache: new InMemoryCache(),
      credentials: 'include',
      headers: {
        authorization: `Bearer ${idToken}`,
      },
    });
  }, [serverAddress, idToken]);
  return callback;
};

export default useGetApolloClient;

// NOTE This is used in loader and actions, which are called on the server
// hence it is not possible to use the useGetApolloClient hook
export const getNewClient = async (request: Request) => {
  const config = getConfig();
  const session = await getSession(request.headers.get('Cookie'));
  const user = session.get('user');
  const idToken = user.authData.extraParams.id_token;

  return new ApolloClient({
    uri: `${config.SERVER.ADDRESS}/graphql`,
    cache: new InMemoryCache(),
    credentials: 'include',
    headers: {
      authorization: `Bearer ${idToken}`,
    },
  });
};
