import React from 'react';
import useAuthContext from '~/contexts/authContext';
import { json, redirect } from '@remix-run/node';
import {
  useLoaderData,
  useSubmit,
  SubmitOptions,
  Form,
  useActionData,
} from '@remix-run/react';

// export async function loader({ request }: any) {}

// NOTE this is not getting called/hit
// neither using the submit() function or using the native form/button submission
// NOTE NOTE NOTE NOTE NOTE NOTE
// it appears as though the native submit is adding the hidden input's name and value to the url
// maybe we can pull the id token out of the request url?
// would that be a security vulnerability by exposing it in the url?
// can it be done, but just needs to be encoded first?
export async function action({ formData }: Request) {
  const data = await formData();
  const test = data.get('test');
  console.log('DATA FROM ACTION', data);
  return json({ test });
}

export default function CheckAuth() {
  const { authClient, setIsLoggedIn } = useAuthContext();
  const [idToken, setIdToken] = React.useState<string | undefined>(undefined);

  // can use this function to trigger an 'empty' action, which will trigger the loader
  const submit = useSubmit();
  const actionData = useActionData();
  console.log('Action Data', actionData);

  // Call auth0 redirect callback
  // get auth0 user id token and set it in state
  React.useEffect(() => {
    const query = window.location.search;
    const hasParams = query.includes('code=') && query.includes('state=');
    const authRedirectCallback = async () => {
      await authClient?.handleRedirectCallback();
      const test = await authClient?.isAuthenticated();
      return test;
    };

    if (hasParams) {
      authRedirectCallback()
        .then((isLoggedIn) => {
          if (isLoggedIn) {
            setIsLoggedIn(isLoggedIn);
            authClient?.getIdTokenClaims().then((claims) => {
              const token = claims?.__raw || '';
              console.log('ID TOKEN', token);
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

  // Use id token to make request to server to validate token and get/set user
  // clear url of auth0 params
  console.log('idToken from component state', idToken);
  // React.useEffect(() => {
  // here is where we would make the call to the server with the fetched id token to validate
  //   console.log(
  //     'this hook should submit the remix action with the idToken and then clear the url params'
  //   );

  //   if (idToken) {
  //     console.log('about to call submit() from effect hook');

  //     submit({ idToken });
  //     window.history.replaceState({}, '', '/checkAuth'); // NOTE change url name
  //   }
  // }, [idToken, submit]);

  return (
    <>
      <main>
        <h1>This will be an 'auth' only page</h1>
        <Form>
          <input type="hidden" name="test" value={'test'} />
          <button type="submit">Test</button>
        </Form>
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
