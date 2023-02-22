import { Form, useLoaderData } from '@remix-run/react';
import getConfig from '~/utils/config.server';
import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { logout } from '~/auth/authenticator';
import { validateUserAndSession } from '~/utils/validateUserAndSession';
import footerStyles from '../generatedStyles/footer.css';
import LandingPageLayout from '~/layouts/LandingPageLayout';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: footerStyles,
      as: 'style',
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const config = getConfig();

  const data = await request.formData();
  const valid = data.get('valid');

  if (valid === 'true') {
    return redirect(config.AUTH0.LOGIN_URL);
  } else {
    return await logout(request, true);
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  return await validateUserAndSession(request);
};

export default function LandingPage() {
  const { valid } = useLoaderData();

  return (
    <LandingPageLayout>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>Welcome to Remix</h1>
        <p>
          This will be the landing page where I'd like to have a nice long page
          with cool scrolling and animations.
        </p>
        <p>
          It will include information about the app in general, along with its
          different features and what not.
        </p>
        <Form method="post">
          <input
            name="valid"
            type="checkbox"
            hidden // hide input from users
            value={valid} // dynamically change value
            defaultChecked={true} // HAS TO BE TRUE in order for data to be sent
          />
          <button type="submit">
            {valid ? 'Continue to homepage' : 'Login'}
          </button>
        </Form>
      </div>
    </LandingPageLayout>
  );
}

// NOTE since this essentially the root of the root page's component tree
// I think it's acceptable to just allow any errors to bubble up from here to the root Error and Catch boundaries
