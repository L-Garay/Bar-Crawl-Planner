import React from 'react';
import { Link } from '@remix-run/react';
import useAuthContext from '~/contexts/authContext';

export default function LandingPage() {
  const { authClient, isLoggedIn } = useAuthContext();

  const attemptLogin = async () => {
    try {
      await authClient?.loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.ENV.AUTH0.LOGIN_URL,
          // once a user hits this page, that is when you start the process to valiate token and user and start session
        },
      });
    } catch (error) {
      // TODO figure out how to handle this case properly
      console.error(error);
    }
  };

  const attemptLogout = async () => {
    // NOTE this is not how this is suppossed to be actually setup
    await authClient?.logout();
    await authClient?.handleRedirectCallback();
  };

  return (
    <>
      {authClient && (
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            lineHeight: '1.4',
          }}
        >
          <h1>Welcome to Remix</h1>
          <Link to="/test">Test Link</Link>
          {isLoggedIn ? (
            <button onClick={attemptLogout}>Logout</button>
          ) : (
            <button onClick={attemptLogin}>Login</button>
          )}
        </div>
      )}
    </>
  );
}
