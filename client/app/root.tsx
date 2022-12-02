import type { ApolloClient } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import useGetApolloClient from './apollo/getClient';
import { authenticator } from './auth/authenticator';
import { AuthProvider } from './contexts/authContext';
import getConfig from './utils/config.server';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export const loader: LoaderFunction = async ({ request }) => {
  const config = getConfig();
  const userData = await authenticator.isAuthenticated(request);

  return { config, userData };
};

export default function App() {
  const { config, userData } = useLoaderData();
  // If there is already a token when 'first' booting up, we will want to run some validation on token before using it to create client
  const getClient = useGetApolloClient(config.SERVER.ADDRESS, userData.token);
  const client = getClient() as ApolloClient<any>;

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(config)}`,
          }}
        />
        <AuthProvider>
          {client ? (
            <ApolloProvider client={client}>
              <Outlet />
            </ApolloProvider>
          ) : (
            <Outlet />
          )}
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
