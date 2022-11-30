import { ApolloProvider } from '@apollo/client';
import type { MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import getApolloClient from './apollo/getClient';
import { AuthProvider } from './contexts/authContext';
import getConfig from './utils/config.server';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export async function loader() {
  const config = getConfig();
  return { config };
}

export default function App() {
  const { config } = useLoaderData();
  const client = getApolloClient(config.SERVER.SERVER_ADDRESS);
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
          <ApolloProvider client={client}>
            <Outlet />
          </ApolloProvider>
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
