import { useLazyQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { GET_ALL_FRIENDSHIPS } from '~/constants/graphqlConstants';
import { CloseX } from '~/components/svgs/closeX';

export type ProfileInOutingProps = {
  profile: Record<string, any>;
  attendanceStatus: string;
  currentUserId: number;
  sentRequests: Record<string, any>[];
  recievedRequests: Record<string, any>[];
  disconnectUser: ({ variables }: { variables: any }) => void;
  outingId: number;
  isOutingCreator: boolean;
  sendFriendRequest?: ({ variables }: { variables: any }) => void;
};

export const ProfileInOuting = ({
  profile,
  sendFriendRequest,
  attendanceStatus,
  currentUserId,
  sentRequests,
  recievedRequests,
  disconnectUser,
  outingId,
  isOutingCreator,
}: ProfileInOutingProps) => {
  const [isHoveringKickIcon, setIsHoveringKickIcon] = useState<boolean>(false);

  const [getAllFriendships, { data: friendsData }] =
    useLazyQuery(GET_ALL_FRIENDSHIPS);

  useEffect(() => {
    if (profile) {
      getAllFriendships({
        variables: {
          target_id: Number(profile.id),
        },
      });
    }
  }, [getAllFriendships, profile]);

  const color = useMemo(() => {
    if (attendanceStatus === 'Accepted') return 'green';
    if (attendanceStatus === 'Pending') return 'grey';
    if (attendanceStatus === 'Declined') return 'red';
    else return 'black';
  }, [attendanceStatus]);

  const sameProfile = profile.id === currentUserId;

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
    const noFriendsCondition =
      !friendsData ||
      friendsData.getAllFriendships === undefined ||
      friendsData.getAllFriendships.length === 0;
    // this indicates that we are unable to get the friendship data OR that the user has no friendships
    if (noFriendsCondition) {
      return false;
    }
    // if the user has friendships, we first check to see if any of them are with the current profile in the list
    // also check to make sure that the status is accepted and not just requested
    // then a final check to make sure it's not the same profile as the current user's
    if (
      friendsData.getAllFriendships.some((friendship: any) => {
        const hasRequested =
          friendship.addressee_profile_id === profile.id ||
          friendship.requestor_profile_id === profile.id;
        if (friendship.status_code === 'A' && hasRequested) {
          return true;
        } else {
          return false;
        }
      }) &&
      !sameProfile
    ) {
      return true;
    }
  }, [friendsData, profile.id, sameProfile]);

  const showFriendRequestButton =
    !sameProfile && profile.account.email_verified == true && !alreadyFriends;

  return (
    <div className="profile-in-outing-container">
      <div
        className="profile-in-outing"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <p style={{ color, paddingRight: 10 }}>
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
            style={{ marginLeft: 10 }}
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
