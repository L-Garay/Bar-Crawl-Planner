import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import { logout } from '~/auth/authenticator';
import { BasicFooter } from '~/components/organisms/Footers';
import { BasicHeader } from '~/components/organisms/Headers';
import { validateUserAndSession } from '~/utils/validateUserAndSession';
import footerStyles from '~/generatedStyles/footer.css';
import headerStyles from '~/generatedStyles/header.css';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_PENDING_OUTINGS_COUNT,
  GET_RECIEVED_FRIEND_REQUEST_COUNT,
} from '~/constants/graphqlConstants';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: headerStyles,
      as: 'style',
    },
    {
      rel: 'stylesheet',
      href: footerStyles,
      as: 'style',
    },
  ];
};

// Having this pathless auth layout route handle user validation will protect all of it's child routes from unauthenticated users
export const loader: LoaderFunction = async ({ request }) => {
  const { valid, user, session } = await validateUserAndSession(request);

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo');
  const outingId = url.searchParams.get('outingId');
  const profileId = url.searchParams.get('profileId');
  const socialPin = url.searchParams.get('socialPin');
  const hasOutingParams = outingId && profileId && socialPin;

  if (!valid && redirectTo && !hasOutingParams) {
    return { redirectTo, valid };
  } else if (!valid && redirectTo && hasOutingParams) {
    return { redirectTo, outingId, profileId, socialPin, valid };
  } else if (!valid && !redirectTo) {
    return logout(request, true);
  }

  return { session, user, valid };
};

export default function AuthLayout() {
  const { redirectTo, outingId, profileId, socialPin, valid } = useLoaderData();
  const navigate = useNavigate();
  const hasOutingParams = outingId && profileId && socialPin;
  const [requestCount, setRequestCount] = useState<number>(0);
  const [outingsCount, setOutingsCount] = useState<number>(0);

  useEffect(() => {
    const url = `/resources/logout?returnToLogin=true`;
    if (redirectTo && !hasOutingParams) {
      window.localStorage.setItem('redirectTo', redirectTo);
      navigate(url);
    } else if (redirectTo && hasOutingParams) {
      const inviteData = JSON.stringify({ outingId, profileId, socialPin });
      window.localStorage.setItem('inviteData', inviteData);
      window.localStorage.setItem('redirectTo', redirectTo);
      navigate(url);
    }
  }, [redirectTo, outingId, profileId, navigate, hasOutingParams, socialPin]);

  useQuery(GET_RECIEVED_FRIEND_REQUEST_COUNT, {
    onCompleted: (data) => {
      setRequestCount(data.getRecievedFriendRequestCount);
    },
  });
  useQuery(GET_PENDING_OUTINGS_COUNT, {
    onCompleted: (data) => {
      setOutingsCount(data.getPendingOutingsCount);
    },
  });

  return (
    <>
      {valid ? (
        <>
          <BasicHeader
            hasFriendRequests={requestCount > 0}
            hasOutingInvites={outingsCount > 0}
          />
          <Outlet />
          <BasicFooter />
        </>
      ) : null}
    </>
  );
}

// Don't believe I should need an Error or Catch boundary here, as the only way to get to this route is to be authenticated
// If there's an error between when the user logs in and then they try to access a protected route, we know something really bad happened
// in which case logging them out should work, and then if the issue persists it should get caught by the root/login pages' error and catch boundaries
