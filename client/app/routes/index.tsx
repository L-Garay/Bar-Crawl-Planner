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
import React from 'react';
import SpinningCube from '~/components/animated/spinningCube';
import styles from '../generatedStyles/landingpage.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: styles,
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
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [showChildren, setShowChildren] = React.useState<boolean>(false);

  // This will only fire once on initial mounting
  React.useEffect(() => {
    const validWindow = window && typeof window !== 'undefined';
    if (canvasRef.current && validWindow) setShowChildren(true);
  }, []);

  React.useEffect(() => {
    const validWindow = window && typeof window !== 'undefined';
    if (showChildren === false && canvasRef.current && validWindow)
      setShowChildren(true);
  }, [showChildren]);

  // window is not defined during initial SSR generation/rendering
  // so we'll need to wait until after first SSR
  // we can try to block the UI on the first render to prevent things jumping/rendering at different times
  // only unblock the UI once the canvas ref is set and window is defined
  // that way we can be certain that passing those values to SpinningCube will not throw an error
  if (showChildren) {
    SpinningCube(canvasRef.current, window);
  }

  return (
    <>
      <canvas ref={canvasRef} className="canvas"></canvas>
      {showChildren && (
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            lineHeight: '1.4',
            position: 'absolute',
          }}
        >
          <h1>Welcome to Remix</h1>
          <p>
            This will be the landing page where I'd like to have a nice long
            page with cool scrolling and animations.
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
      )}
    </>
  );
}
