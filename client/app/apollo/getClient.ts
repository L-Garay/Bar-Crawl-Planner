import { ApolloClient, InMemoryCache } from '@apollo/client';
import React from 'react';

const useGetApolloClient = (serverAddress: string, idToken?: string) => {
  const callback = React.useCallback(() => {
    if (serverAddress) {
      return new ApolloClient({
        uri: `${serverAddress}/playground`,
        cache: new InMemoryCache(),
        credentials: 'include',
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      });
    }
  }, [serverAddress, idToken]);
  return callback;
};

export default useGetApolloClient;
