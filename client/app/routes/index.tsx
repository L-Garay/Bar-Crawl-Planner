import React from 'react';
import { Link } from '@remix-run/react';
import useAuthContext from '~/contexts/authContext';

export default function LandingPage() {
  const { authClient } = useAuthContext();
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | undefined>(
    false
  );

  React.useMemo(async () => {
    const status = await authClient?.isAuthenticated();
    setIsLoggedIn(status);
  }, [authClient]);

  const attemptLogin = async () => {
    try {
      await authClient?.loginWithRedirect({
        authorizationParams: {
          // TODO figure out why after successful login and redirect to proper page; query params of 'code' and 'state' are added to url
          redirect_uri: window.ENV.AUTH0.LOGIN_URL,
        },
      });
    } catch (error) {
      // TODO figure out how to handle this case properly
      console.error(error);
    }
  };

  const attemptLogout = async () => {
    await authClient?.logout();
    await authClient?.handleRedirectCallback();
  };

  console.log(isLoggedIn);

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
