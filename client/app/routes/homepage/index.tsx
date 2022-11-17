import React from 'react';
import useAuthContext from '~/contexts/authContext';

export default function HomePage() {
  const { authClient, isLoggedIn } = useAuthContext();
  console.log(isLoggedIn, 'from the actual homepage');

  return (
    <>
      <main>
        <h1>This is the Home Page</h1>
        <p>
          This is the page users will land when they have logged, they've been
          authenticated and a user session has been created for them
        </p>
      </main>
    </>
  );
}
