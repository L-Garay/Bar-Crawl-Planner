import { useLazyQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { GET_ALL_FRIENDSHIPS } from '~/constants/graphqlConstants';
import { CloseX } from '../svgs/closeX';

export type ProfileInOutingProps = {
  profile: Record<string, any>;
  sendFriendRequest: ({ variables }: { variables: any }) => void;
  attendanceStatus: string;
  currentUser: number;
  sentRequests: Record<string, any>[];
  recievedRequests: Record<string, any>[];
  disconnectUser: ({ variables }: { variables: any }) => void;
  outingId: number;
};

export const ProfileInOuting = ({
  profile,
  sendFriendRequest,
  attendanceStatus,
  currentUser,
  sentRequests,
  recievedRequests,
  disconnectUser,
  outingId,
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

  const sameProfile = useMemo(() => {
    if (profile.id === currentUser) {
      return true;
    } else {
      return false;
    }
  }, [profile, currentUser]);

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
    if (!friendsData || friendsData.getAllFriendships === null) return false;
    return friendsData.getAllFriendships.status_code === 'A';
  }, [friendsData]);

  return (
    <div className="profile-in-outing-container">
      <div
        className="profile-in-outing"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <p style={{ color, paddingRight: 10 }}>
          {profile.name} with id {profile.id}
        </p>
        <p>({attendanceStatus})</p>
        {alreadyFriends ? (
          <p>(Friend)</p>
        ) : !sameProfile ? (
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
        {sameProfile ? null : (
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
