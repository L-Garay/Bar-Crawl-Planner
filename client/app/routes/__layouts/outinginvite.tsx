import { useMutation } from '@apollo/client';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useEffect } from 'react';
import {
  CONNECT_PROFILE,
  DISCONNECT_PROFILE,
  GENERATE_OUTING_NOTIFICATIONS,
} from '~/constants/graphqlConstants';
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
  const navigate = useNavigate();
  const { outingId, profileId, socialPin, isValid, config } = useLoaderData();

  const [DisconnectProfile] = useMutation(DISCONNECT_PROFILE);
  const [ConnectProfile] = useMutation(CONNECT_PROFILE);
  const [generateNotifications] = useMutation(GENERATE_OUTING_NOTIFICATIONS);

  // save inviteData to local storage if user does not have valid session
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
    // if they have a valid user/session, connect them to the outing (pending to accepted)
    if (isValid) {
      await ConnectProfile({
        variables: {
          profile_id: Number(profileId),
          outing_id: Number(outingId),
        },
      });
      // send notificaiton that user has joined
      await generateNotifications({
        variables: {
          outing_id: Number(outingId),
        },
      });
      navigate(`/outings/my-outings/${outingId}`);
    } else {
      // if they don't have a valid user/session, check if inviteData is set and set if not, then navigate to login
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
    // if they have a valid user/session, disconnect them from the outing (pending to declined)
    if (isValid) {
      await DisconnectProfile({
        variables: {
          profile_id: Number(profileId),
          outing_id: Number(outingId),
        },
      });
      navigate('/outings/my-outings');
    } else {
      // have to use fetch here because useMutation doesn't work with no valid client
      // which without a valid user/session there can't be a valid client because there is no id_token to use
      // NOTE is this considered bad practice? I just can't think of another way to do this
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
