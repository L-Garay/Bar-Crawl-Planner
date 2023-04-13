import { useMemo, useState } from 'react';
import { CloseX } from '~/components/svgs/closeX';
import type { FriendshipData } from '~/types/sharedTypes';

export type ProfileInOutingProps = {
  profile: Record<string, any>;
  attendanceStatus: string;
  currentUserId: number;
  sentRequests: Record<string, any>[];
  recievedRequests: Record<string, any>[];
  friends: FriendshipData[];
  disconnectUser: ({ variables }: { variables: any }) => void;
  outingId: number;
  isOutingCreator: boolean;
  sendFriendRequest?: ({ variables }: { variables: any }) => void;
  friendsError?: boolean;
};

export const ProfileInOuting = ({
  profile,
  attendanceStatus,
  currentUserId,
  sentRequests,
  recievedRequests,
  friends,
  disconnectUser,
  outingId,
  isOutingCreator,
  sendFriendRequest,
  friendsError,
}: ProfileInOutingProps) => {
  const [isHoveringKickIcon, setIsHoveringKickIcon] = useState<boolean>(false);
  const sameProfile = profile.id === currentUserId;

  const color = useMemo(() => {
    if (attendanceStatus === 'Accepted') return 'green';
    if (attendanceStatus === 'Pending') return 'grey';
    if (attendanceStatus === 'Declined') return 'red';
    else return 'black';
  }, [attendanceStatus]);

  const alreadyRequested = useMemo(() => {
    if (!sentRequests) return false;
    return sentRequests.some((request) => {
      return request.addressee_profile_id === Number(profile.id);
    });
  }, [profile.id, sentRequests]);

  const hasRecievedRequest = useMemo(() => {
    if (!recievedRequests) return false;
    return recievedRequests.some((request) => {
      return request.sender_profile_id === Number(profile.id);
    });
  }, [profile.id, recievedRequests]);

  const alreadyFriends = useMemo(() => {
    if (friendsError || friends.length === 0 || sameProfile) {
      return false;
    }
    // if the user has friendships, we first check to see if any of them are with the current profile in the list
    // also check to make sure that the status is accepted and not just requested
    // then a final check to make sure it's not the same profile as the current user's
    if (
      friends.some((friendship: FriendshipData) => {
        const hasRequested =
          friendship.addressee_profile_id === profile.id ||
          friendship.requestor_profile_id === profile.id;
        if (friendship.status_code === 'A' && hasRequested) {
          return true;
        } else {
          return false;
        }
      })
    ) {
      return true;
    } else {
      return false;
    }
  }, [friends, friendsError, profile.id, sameProfile]);

  // by early returning 'false' if there is an error getting friends, that could potentially cause the friend request button to be rendered icnorrectly
  // since the check for '!alreadyFriends' will return true
  // so we need to also check if there is an error getting friends
  // which should then ensure that if there is an error getting friends, that we just don't render anything friend related (no button, no friend text on lines 120-137)
  const showFriendRequestButton =
    !sameProfile &&
    profile.account.email_verified == true &&
    !alreadyFriends &&
    !friendsError;

  return (
    <div className="profile-in-outing-container">
      <div className="profile-in-outing flex">
        <p className="profile-name" style={{ color }}>
          {sameProfile ? 'You' : `${profile.name} with id ${profile.id}`}
        </p>
        <p>({attendanceStatus})</p>
        {alreadyFriends ? (
          <p>(Friend)</p>
        ) : showFriendRequestButton && sendFriendRequest ? (
          <button
            disabled={alreadyRequested || hasRecievedRequest}
            onClick={() => {
              sendFriendRequest({
                variables: {
                  addressee_profile_id: Number(profile.id),
                },
              });
            }}
          >
            {alreadyRequested || hasRecievedRequest
              ? 'Request Pending'
              : 'Send Friend Request'}
          </button>
        ) : null}
        {sameProfile || !isOutingCreator ? null : (
          <div
            onMouseEnter={() => setIsHoveringKickIcon(true)}
            onMouseLeave={() => setIsHoveringKickIcon(false)}
            className="remove-user"
            onClick={() =>
              disconnectUser({
                variables: {
                  profile_id: Number(profile.id),
                  outing_id: Number(outingId),
                  original_state: attendanceStatus,
                },
              })
            }
          >
            <CloseX
              pathId={profile.id}
              size="medium"
              stroke={isHoveringKickIcon ? 'red' : 'black'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInOuting;
