import React from 'react';
import type { Auth0Client } from '@auth0/auth0-spa-js';
import getAuthOClient from '../auth/authClient';
import type { LoaderFunction } from '@remix-run/node';
import getConfig from '~/utils/getConfig';
import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async () => {
  const environmentVariables = process.env;
  const config = getConfig(environmentVariables);
  return { config };
};

export default function TestView() {
  const { config } = useLoaderData();
  const [authClient, setAuthClient] = React.useState<Auth0Client | undefined>(
    undefined
  );

  React.useEffect(() => {
    const getAndSetClient = async () => {
      const client = await getAuthOClient(config);
      setAuthClient(client);
    };

    getAndSetClient().catch((error) => {
      console.error(error);
    });
  }, [config]);

  return (
    <>
      {authClient && (
        <main>
          <h1>This should be an asynchronous page</h1>
          <p>
            As in, the rendering of this page waits for an asynchronous request
            to resolve
          </p>
        </main>
      )}
    </>
  );
}
