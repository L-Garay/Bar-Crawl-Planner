import React from 'react';
import type { Auth0Client } from '@auth0/auth0-spa-js';
import getAuthOClient from '../auth/authClient';

type AuthContextState = {
  authClient?: Auth0Client;
};

const AuthContext = React.createContext({} as AuthContextState);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authClient, setAuthClient] = React.useState<Auth0Client | undefined>(
    undefined
  );

  React.useEffect(() => {
    const getAndSetClient = async () => {
      const client = await getAuthOClient(window.ENV);
      setAuthClient(client);
    };

    getAndSetClient().catch((error) => {
      console.error(error);
    });
  }, []);

  const state = { authClient };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export default function useAuthContext() {
  return React.useContext(AuthContext);
}
