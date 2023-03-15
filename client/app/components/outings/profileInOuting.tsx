import { useNavigate } from '@remix-run/react';
import { useMemo } from 'react';
import { useNotificationContext } from '~/contexts/notificationContext';

export type ProfileInOutingProps = {
  profile: Record<string, any>;
  sendFriendRequest: ({ variables }: { variables: any }) => void;
  attendanceStatus: string;
  currentUser: number;
};

export const ProfileInOuting = ({
  profile,
  sendFriendRequest,
  attendanceStatus,
  currentUser,
}: ProfileInOutingProps) => {
  const navigate = useNavigate();
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

  const { sentFriendRequests, receivedFriendRequests } =
    useNotificationContext();

  const alreadyRequested = useMemo(() => {
    if (!sentFriendRequests) return false;
    return sentFriendRequests.some((request) => {
      return request.addressee_profile_id === Number(profile.id);
    });
  }, [profile.id, sentFriendRequests]);

  const hasRecievedRequest = useMemo(() => {
    if (!receivedFriendRequests) return false;
    return receivedFriendRequests.some((request) => {
      return request.sender_profile_id === Number(profile.id);
    });
  }, [profile.id, receivedFriendRequests]);
  console.log(receivedFriendRequests, hasRecievedRequest);

  return (
    <div className="profile-in-outing-container">
      <div className="profile-in-outing" style={{ display: 'flex' }}>
        <p style={{ color, paddingRight: 10 }}>
          {profile.name} with id {profile.id}
        </p>
        <p>({attendanceStatus})</p>
        {!sameProfile && !hasRecievedRequest ? (
          <button
            disabled={alreadyRequested}
            onClick={() => {
              sendFriendRequest({
                variables: {
                  addressee_profile_id: Number(profile.id),
                },
              });
            }}
          >
            {alreadyRequested ? 'Request Pending' : 'Send Friend Request'}
          </button>
        ) : hasRecievedRequest ? (
          <button onClick={() => navigate('/friends')}>
            Respond to friend request
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileInOuting;
