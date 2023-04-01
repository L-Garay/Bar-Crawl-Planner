import { useMutation, useQuery } from '@apollo/client';
import {
  GET_BLOCKED_PROFILES,
  UNBLOCK_PROFILE,
} from '~/constants/graphqlConstants';

export default function ProfileIndex() {
  const { data: blockedProfiles } = useQuery(GET_BLOCKED_PROFILES);
  console.log('blockedProfiles', blockedProfiles);

  const [unblockProfile, { data: unblockedProfile }] = useMutation(
    UNBLOCK_PROFILE,
    {
      refetchQueries: [GET_BLOCKED_PROFILES],
    }
  );

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
        <div className="blocked-profiles-container">
          <h3>Blocked Profiles</h3>
          <div className="blocked-profiles-list">
            {blockedProfiles && blockedProfiles.getBlockedProfiles.length ? (
              <ul>
                {blockedProfiles.getBlockedProfiles.map((profile: any) => (
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
        </div>
      </div>
    </>
  );
}
