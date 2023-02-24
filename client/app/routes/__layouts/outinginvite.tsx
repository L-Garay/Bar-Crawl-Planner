import { useMutation } from '@apollo/client';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useEffect } from 'react';
import { DISCONNECT_PROFILE } from '~/constants/graphqlConstants';
import getConfig from '~/utils/config.server';
import { validateUserAndSession } from '~/utils/validateUserAndSession';

export const loader: LoaderFunction = async ({ params, request, context }) => {
  const url = new URL(request.url);
  const outingId = url.searchParams.get('outingId');
  const profileId = url.searchParams.get('profileId');
  const socialPin = url.searchParams.get('socialPin');

  const config = getConfig();
  const { valid } = await validateUserAndSession(request);

  return { outingId, profileId, socialPin, isValid: valid, config };
};

export default function OutingInvite() {
  const { outingId, profileId, socialPin, isValid, config } = useLoaderData();
  const navigate = useNavigate();

  const [
    DisconnectProfile,
    {
      loading: connectionLoading,
      error: connectionError,
      data: connectionData,
    },
  ] = useMutation(DISCONNECT_PROFILE);

  useEffect(() => {
    if ((outingId || profileId || socialPin) && !isValid && window) {
      const inviteData = {
        outingId,
        profileId,
        socialPin,
        returnTo: `/outings/my-outings/${outingId}`,
      };
      console.log('setting invite data in local storage', inviteData);

      window.localStorage.setItem('inviteData', JSON.stringify(inviteData));
    }
  }, [outingId, profileId, socialPin, isValid]);

  const handleAccept = async () => {
    if (isValid) {
      navigate(`/outings/my-outings/${outingId}`);
    } else {
      const inviteData = window.localStorage.getItem('inviteData');
      if (!inviteData) {
        const inviteData = {
          outingId,
          profileId,
          socialPin,
          returnTo: `/outings/my-outings/${outingId}`,
        };
        window.localStorage.setItem('inviteData', JSON.stringify(inviteData));
      }
      navigate(`/login`);
    }
  };

  const handleDecline = async () => {
    if (isValid) {
      await DisconnectProfile({
        variables: {
          profile_id: Number(profileId),
          outing_id: Number(outingId),
        },
      });
      window.localStorage.removeItem('inviteData');
      navigate('/outings/my-outings');
    } else {
      await fetch(`${config.SERVER.ADDRESS}/disconnect-user`, {
        method: 'POST',
        body: `profileId=${profileId}&outingId=${outingId}`,
      });
      window.localStorage.removeItem('inviteData');
      navigate('/');
    }
  };

  return (
    <div>
      <h1>Outing Invite Page</h1>
      <div>
        {/* TODO put outing details here */}
        <p>outing details will go here</p>
      </div>
      <div>
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleDecline}>Decline</button>
      </div>
    </div>
  );
}
