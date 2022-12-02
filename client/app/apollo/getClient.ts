import { ApolloClient, InMemoryCache } from '@apollo/client';
import React from 'react';

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
