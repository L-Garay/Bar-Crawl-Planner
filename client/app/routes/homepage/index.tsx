import React from 'react';
import useAuthContext from '~/contexts/authContext';

export default function HomePage() {
  const { authClient } = useAuthContext();

  const attemptLogout = async () => {
    await authClient?.logout();
    await authClient?.handleRedirectCallback();
  };

  // TODO figure out why this is always returning 'false'
  authClient?.isAuthenticated().then((data) => console.log(data));

  return (
    <>
      <main>
        <h1>This is the homepage</h1>
        <button onClick={attemptLogout}>Logout</button>
      </main>
    </>
  );
}
