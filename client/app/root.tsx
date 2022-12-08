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
import getConfig from './utils/config.server';
import { validateUserAndSession } from './utils/validateUserAndSession';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export const loader: LoaderFunction = async ({ request }) => {
  const config = getConfig();
  const { valid, user } = await validateUserAndSession(request);

  return { config, user, valid };
};

function Document({
  children,
  title = `Bar Crawl Planner`,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <LiveReload />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { config, user } = useLoaderData();

  // If there is already a token when 'first' booting up, we will want to run some validation on token before using it to create client (even though we create a client anyway)
  // This will be handled by the validateUserAndSession() used on both the login route and the landng page
  // Depending on the outcome of that function, userData will either be properly set or not
  // If it is properly set, that means 1) all credentials were valid to begin with or 2) new credentials have been set
  // In either case, we can be confident the client will still be configured properly (since creds haven't changed or it will get recreated by the callback below)
  // If it is not properly set, that means the creds were expired or no one is logged in
  // If the creds are expired, the other pages should handle having the user log in and therefore a user shouldn't be able to see/interact with any pages that would need to make gql requests
  // If no one is logged in, same situation as expired creds, the other pages should handle having the user log in and therefore they shouldn't be able to interact with any pages that make gql requests MEANING it is okay to have a 'bad' temporary client until they do log in and a new client is created for them by the callback
  const getClient = useGetApolloClient(config.SERVER.ADDRESS, user?.token);
  const client = getClient() as ApolloClient<any>;

  return (
    <Document>
      <ApolloProvider client={client}>
        <Outlet />
      </ApolloProvider>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
