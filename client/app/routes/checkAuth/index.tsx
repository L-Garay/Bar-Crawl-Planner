import React from 'react';
import useAuthContext from '~/contexts/authContext';
import { json, redirect } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';

export async function loader({ request }: any) {
  console.log('HIT THE LOADER');
  return json({ foo: 'bar' });
}

export async function action({ request }: any) {
  const data = await request.formData();
  const token = data.get('idToken');
  console.log('DATA FROM ACTION', token);
  // here is where will make the server call to our api and hit the /start-session (route name TBD)
  // need to pass idToken to validate and get/create user
  // a user will then returned
  // we will need to create a Remix session for said user
  // then we will need to redirect them to the homepage
  return redirect('/homepage');
}

export default function CheckAuth() {
  const { authClient, setIsLoggedIn } = useAuthContext();
  const [idToken, setIdToken] = React.useState<string | undefined>(undefined);

  // can use this function to trigger an action call programatically
  const submit = useSubmit();

  // Call auth0 redirect callback
  // get auth0 user id token and set it in state
  React.useEffect(() => {
    const query = window.location.search;
    const hasParams = query.includes('code=') && query.includes('state=');

    const authRedirectCallback = async () => {
      await authClient?.handleRedirectCallback();
      const isAuthenticated = await authClient?.isAuthenticated();
      return isAuthenticated;
    };

    if (hasParams) {
      authRedirectCallback()
        .then((isLoggedIn) => {
          if (isLoggedIn) {
            setIsLoggedIn(isLoggedIn);
            authClient?.getIdTokenClaims().then((claims) => {
              //NOTE should we send the raw token or the entire claims object?
              const token = claims?.__raw || '';
              setIdToken(token);
            });
          }
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    }
  }, [authClient, setIsLoggedIn]);

  // Use id token and make request to Remix server
  // clear url of auth0 params
  React.useEffect(() => {
    if (idToken) {
      submit(
        { idToken },
        { method: 'post', action: '/checkAuth/?index', replace: false }
      );
      window.history.replaceState({}, '', '/checkAuth'); // NOTE change url name
    }
  }, [idToken, submit]);

  return (
    <>
      <main>
        <h1>This will be an 'auth' only page</h1>
        <p>
          This is the intermediate page where we will validate token and claims
          from auth0 sign-redirect
        </p>
        <p>We will need to call the server to validate token and set user</p>
        <p>If that works then we will have Remix create a session</p>
        <p>Then we will navigate to homepage</p>
        <p>
          For the UI we can display a loading spinner or icon with some text
          saying we are fetching things/getting things ready
        </p>
        <small>
          Maybe this will be what Remix calls a 'Resource route'
          (https://remix.run/docs/en/v1/guides/resource-routes){' '}
        </small>
      </main>
    </>
  );
}
