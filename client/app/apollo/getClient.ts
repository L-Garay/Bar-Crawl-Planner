import { ApolloClient, InMemoryCache } from '@apollo/client';
import React from 'react';
import { getSession } from '~/auth/session';
import getConfig from '~/utils/config.server';

// NOTE I believe the way this is configured and implemented, each time a user accesses the site, they will get just one instance of the client
// each different user will get a different instance of the client, since the client is created based on the idToken
// however, this makes me think that 'visitors' might get the same client? (I need to learn how clients work more)
// See this discussion where Apollo dev says that it's not required to create a new client for each request https://github.com/apollographql/apollo-client/issues/9520
const useGetApolloClient = (serverAddress: string, idToken?: string) => {
  const callback = React.useCallback(() => {
    if (idToken) {
      return new ApolloClient({
        uri: `${serverAddress}/graphql`,
        cache: new InMemoryCache(),
        credentials: 'include',
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      });
    } else {
      return new ApolloClient({
        uri: `${serverAddress}/graphql`,
        cache: new InMemoryCache(),
        credentials: 'include',
      });
    }
  }, [serverAddress, idToken]);
  return callback;
};

export default useGetApolloClient;

// NOTE for testing on the Account page, to see if I can send mutation from Remix action
// NOTE this did not work, it was producing 400 bad request errors
export const getNewClient = async (request: Request) => {
  const config = getConfig();
  const session = await getSession(request.headers.get('Cookie'));
  const user = session.get('user');
  return new ApolloClient({
    uri: `${config.SERVER.ADDRESS}/graphql`,
    cache: new InMemoryCache(),
    credentials: 'include',
    headers: {
      authorization: `Bearer ${user.token}`,
    },
  });
};
