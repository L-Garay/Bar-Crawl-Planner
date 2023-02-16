import { gql } from '@apollo/client';
import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getNewClient } from '~/apollo/getClient';
import getConfig from '~/utils/config.server';
import { validateUserAndSession } from '~/utils/validateUserAndSession';

export const CONNECT_PROFILE = gql`
  mutation ConnectUserWithOuting($outing_id: Int!, $profile_id: Int!) {
    ConnectUserWithOuting(outing_id: $outing_id, profile_id: $profile_id) {
      id
      name
    }
  }
`;

export const loader: LoaderFunction = async ({ params, request, context }) => {
  const config = getConfig();
  const url = new URL(request.url);
  const outingId = url.searchParams.get('outingId');
  const profileId = url.searchParams.get('profileId');

  const { valid } = await validateUserAndSession(request);

  // NOTE we'll probably want to include some fallback logic here in case the mutation fails
  if (valid) {
    try {
      const client = await getNewClient(request);
      await client.mutate({
        mutation: CONNECT_PROFILE,
        variables: {
          profile_id: Number(profileId),
          outing_id: Number(outingId),
        },
      });
    } catch (error: any) {
      const customError = error.networkError
        ? error.networkError.result.errors[0]
        : error;
      console.log('Error connecting profile and outing', customError);
    }

    const outingUrl = `/outings/my-outings/${outingId}`;
    return redirect(outingUrl);
  } else {
    const loginUrlWithParams = `${config.AUTH0.LOGIN_PAGE}?profileId=${profileId}&returnTo=/resources/user-and-accepted&outingId=${outingId}`;
    return redirect(loginUrlWithParams);
  }
};
