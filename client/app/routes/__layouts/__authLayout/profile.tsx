import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import {
  GET_BLOCKED_PROFILES,
  GET_PROFILE,
  UNBLOCK_PROFILE,
} from '~/constants/graphqlConstants';
import type { BasicProfile } from '~/types/sharedTypes';
import logApolloError from '~/utils/getApolloError';

export default function ProfileIndex() {
  const [profile, setProfile] = useState<BasicProfile | null>(null);
  const [blockedProfiles, setBlockedProfiles] = useState<BasicProfile[]>([]);
  const [showError, setShowError] = useState<boolean>(false);

  useQuery(GET_PROFILE, {
    onCompleted: (data) => {
      setProfile(data.getProfile);
    },
    onError: (error) => {
      logApolloError(error);
      setShowError(true);
    },
  });
  useQuery(GET_BLOCKED_PROFILES, {
    onCompleted: (data) => {
      setBlockedProfiles(data.getBlockedProfiles);
    },
    onError: (error) => {
      logApolloError(error);
      setShowError(true);
    },
  });

  const [unblockProfile] = useMutation(UNBLOCK_PROFILE, {
    refetchQueries: [GET_BLOCKED_PROFILES],
  });
  const social_pin = profile ? profile.social_pin : '';

  useEffect(() => {
    const errorTimeout = setTimeout(() => {
      setShowError(false);
    }, 5000);

    return () => clearTimeout(errorTimeout);
  }, [showError]);

  return (
    <>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '1.4',
        }}
      >
        <h1>This will be the Profile page</h1>
        <p>
          This will be where users can add/update their profile picture
          (thinking if we'll need to screen/filter out bad ones)
        </p>
        <p>
          OR maybe we can just have them choose an 'avatar', which could be an
          icon/svg (maybe animated), or something predetermined{' '}
        </p>
        <p>This page could also be where users can set certain preferences</p>
        <p>
          I'm thinking things like: light/dark mode of site, who can/can't send
          friend requests, and more when I think of them haha
        </p>
        <p>
          Obviously they'll be able to update any other profile information if
          needed
        </p>
        <p>
          As far as design, again I'm not too sure how I want this to look. But
          I figure it's 'okay' for it to be more basic, but it'd be nice if it
          looked cool
        </p>
        <div
          className="social-pin"
          style={{ display: 'flex', alignContent: 'center' }}
        >
          Your social pin:
          <p style={{ margin: 0, marginLeft: 10, fontWeight: 'bolder' }}>
            {' '}
            {social_pin}
          </p>
        </div>
        <div className="blocked-profiles-container">
          <h3>Blocked Profiles</h3>
          <div className="blocked-profiles-list">
            {blockedProfiles.length ? (
              <ul>
                {blockedProfiles.map((profile: any) => (
                  <li key={profile.id}>
                    <p>
                      {profile.name} with id {profile.id}
                      <span style={{ display: 'inline', paddingLeft: 8 }}>
                        <button
                          onClick={() =>
                            unblockProfile({
                              variables: {
                                blocked_profile_id: profile.id,
                              },
                            })
                          }
                        >
                          Unblock
                        </button>
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You like everyone</p>
            )}
          </div>
          {showError && (
            <div className="error-message">
              <p>We are unable to save your changes at this time.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
