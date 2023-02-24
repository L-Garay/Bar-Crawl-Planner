import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react';
import getConfig from './utils/config.server';
import { validateUserAndSession } from './utils/validateUserAndSession';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export const loader: LoaderFunction = async ({ request }) => {
  const config = getConfig();
  if (!config) {
    throw new Response('Internal configuration error', { status: 500 });
  }
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
  // can put any top level providers here if needed
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

// I'm assuming it'll be the shape of whatever error is encounterd in a component
// So it may be difficult to access specific/custom properties on the error object
//  NOTE do we even want to show any particulars of the error to the client?
// or should this just be a generic 'something went wrong' page?
// I'm thinking since this is the root error boundary component, we should just show a generic 'something went wrong' page
// and then have each route handle their own error boundarys
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Uh-oh! Something went wrong">
      <div className="error-container">
        <h1>This will be the root error bondary</h1>
        <pre>{error.message}</pre>
        <p>
          It will display a generic message indicating that something went wrong
        </p>
        <p>
          We can try to figure out what caused the error and show a
          semi-specific message here with steps/suggestions to fix or saying we
          are aware/workign on it
        </p>
        <p>
          But we should also have a more specific error boundary for each
          route/page that can do that job, and so if we do reach here it may
          just be worth it to show a message that says to retry later and
          contact support if problem continues like below
        </p>
        <p>
          Oops! Looks like our server had a little too much to drink. We're
          working on it!
        </p>
        <p>
          If the problem persists please contact customer support by calling
          (208) 999-8888 or emailing test@mail.com
        </p>
      </div>
    </Document>
  );
}

// This will get triggered when an action or loader throws a Resposne
// Think of it like catching 'known' errors, whereas the ErrorBoundary will catch 'unknown' (uncaught) errors
// since this is on the root route/page, it will catch all errors (if not caught by a child route/page)
// given that, these message can be more generic
export function CatchBoundary() {
  const caught = useCatch();

  // NOTE this is straight from the Remix docs https://remix.run/docs/en/v1/tutorials/jokes#expected-errors
  // It might help to think of the unexpected errors as 500-level errors (server errors) and the expected errors as 400-level errors (client errors).

  // It seems that if the status is part of this switch, it will get caught by the CatchBoundary
  // however, if ther response status is not part of this switch, it will get caught by the ErrorBoundary
  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;
    case 400:
    case 403:
    case 405:
    case 406:
    case 407:
    case 408:
    case 409:
    case 410:
      message = <p>Oops! Something went wrong. Please try again.</p>;
      break;
    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`Uh-oh Please try again.`}>
      <h1>{caught.status}</h1>
      {message}
    </Document>
  );
}
