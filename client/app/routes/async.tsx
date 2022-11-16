import useAuthContext from '~/auth/authContext';
// import type { LoaderFunction } from '@remix-run/node';

// export const loader: LoaderFunction = async () => {};

export default function TestView() {
  const { authClient } = useAuthContext();
  console.log(authClient);

  return (
    <>
      {authClient && (
        <main>
          <h1>This should be an asynchronous page</h1>
          <p>
            As in, the rendering of this page waits for an asynchronous request
            to resolve
          </p>
        </main>
      )}
    </>
  );
}
