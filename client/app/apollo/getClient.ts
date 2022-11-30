import type { NormalizedCacheObject } from '@apollo/client';
import { ApolloClient, InMemoryCache } from '@apollo/client';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

const getApolloClient = (serverAddress: string) => {
  if (!apolloClient) {
    return new ApolloClient({
      uri: `${serverAddress}/playground`,
      cache: new InMemoryCache(),
    });
  } else return apolloClient;
};

export default getApolloClient;
