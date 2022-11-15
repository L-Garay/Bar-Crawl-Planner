import React, { useState, useEffect } from 'react';
import type { Auth0Client } from '@auth0/auth0-spa-js';
import getAuthOClient from '../auth/authClient';

// NOTE loader is exported and used in server, which tries to call this client side only auth0 module
// the module tries to access 'document' which is not defined in the server

// export const loader: LoaderFunction = async () => {
//   const authClient = await getAuthOClient();
//   return authClient;
// };

// NOTE in this current configuration, getting the error
// Cannot read properties of null (reading 'useState')
// which would indicate that react is not imported at the time this is code is hit
const TestView = async () => {
  const [authClient, setAuthClient] = useState<Auth0Client | undefined>(
    undefined
  );

  useEffect(() => {
    const getAndSetClient = async () => {
      const client = await getAuthOClient();
      setAuthClient(client);
    };

    getAndSetClient().catch((error) => {
      console.error(error);
    });
  }, []);

  return (
    <>
      {authClient && (
        <main>
          <h1>This should be an asynchronous page</h1>
        </main>
      )}
    </>
  );
};

export default TestView;
