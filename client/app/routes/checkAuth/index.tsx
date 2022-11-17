import React from 'react';
import useAuthContext from '~/contexts/authContext';
// import { redirect } from '@remix-run/node';

// export async function loader({ request }) {
//   const url = new URL(request.url);
//   const hasParams =
//     url.searchParams.has('code=') && url.searchParams.has('state=');
//   if (hasParams) {
//     // here we can attempt to
//   }
// }

export default function CheckAuth() {
  const { authClient, isLoggedIn } = useAuthContext();

  React.useEffect(() => {
    const query = window.location.search;
    const hasParams = query.includes('code=') && query.includes('state=');

    const authRedirectCallback = async () => {
      await authClient?.handleRedirectCallback();
      console.log('Handled log in');
      const test = await authClient?.isAuthenticated();
      console.log(test, 'TESTSTSSTS');
    };

    if (hasParams) {
      // indicates that login was successul
      authRedirectCallback().catch((error) => {
        throw error;
      });
      // This will update the url and presumably reset the state, however it does not actually push the user to the new url
      // the user still sees this page's text, even though the url is '/homepage'
      // it seems as though Remix wants you to handle redirects from the server
      // however that would require using the loader
      // I'm not sure if the loader will have access to authClient to get the id token
      // NOTE I am seeing a network request for 'token' which has a response object that includes all of the information that would be required
      // however I'm not sure who/what is making that request and how to intercept the response
      // window.history.replaceState({}, document.title, '/homepage');
    }
  }, [authClient]);

  return (
    <>
      <main>
        <h1>This will be an 'invisible' page</h1>
        <p>
          This is the intermediate page where we will validate token and claims
          from auth0 sign-redirect
        </p>
        <small>
          Maybe this will be what Remix calls a 'Resource route'
          (https://remix.run/docs/en/v1/guides/resource-routes){' '}
        </small>
      </main>
    </>
  );
}
