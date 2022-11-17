import React from 'react';
import type { Auth0Client } from '@auth0/auth0-spa-js';
import getAuthOClient from '../auth/authClient';

type AuthContextState = {
  authClient?: Auth0Client;
  isLoggedIn?: boolean;
};

const AuthContext = React.createContext({} as AuthContextState);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authClient, setAuthClient] = React.useState<Auth0Client | undefined>(
    undefined
  );
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | undefined>(
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

  React.useEffect(() => {
    const getAndSetLoggedIn = async () => {
      const status = await authClient?.isAuthenticated();
      console.log(status, 'from effect hook in context');

      setIsLoggedIn(status);
    };

    getAndSetLoggedIn().catch((error) => {
      console.error(error);
    });
  }, [authClient]);

  const state = { authClient, isLoggedIn };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export default function useAuthContext() {
  return React.useContext(AuthContext);
}
