import { useLazyQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { GET_FRIENDSHIP_STATUS } from '~/constants/graphqlConstants';

export type ProfileInOutingProps = {
  profile: Record<string, any>;
  sendFriendRequest: ({ variables }: { variables: any }) => void;
  attendanceStatus: string;
  currentUser: number;
  sentRequests: Record<string, any>[];
  recievedRequests: Record<string, any>[];
};

export const ProfileInOuting = ({
  profile,
  sendFriendRequest,
  attendanceStatus,
  currentUser,
  sentRequests,
  recievedRequests,
}: ProfileInOutingProps) => {
  // const { sentFriendRequests, receivedFriendRequests, setShouldQuery } =
  //   useNotificationContext();

  // NOTE for testing purposes, this will be removed
  // useEffect(() => setShouldQuery(true), []);

  const [
    getFriendshipStatus,
    { data: statusData, error: friendshipStatusError },
  ] = useLazyQuery(GET_FRIENDSHIP_STATUS);

  useEffect(() => {
    if (profile) {
      getFriendshipStatus({
        variables: {
          target_id: Number(profile.id),
        },
      });
    }
  }, [getFriendshipStatus, profile]);

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
    if (!statusData || statusData.getFriendshipStatus === null) return false;
    return statusData.getFriendshipStatus.status_code === 'A';
  }, [statusData]);

  return (
    <div className="profile-in-outing-container">
      <div className="profile-in-outing" style={{ display: 'flex' }}>
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
      </div>
    </div>
  );
};

export default ProfileInOuting;
