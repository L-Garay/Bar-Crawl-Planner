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

  const { sentFriendRequests } = useNotificationContext();

  const alreadyRequested = useMemo(() => {
    if (!sentFriendRequests) return false;
    return sentFriendRequests.some((request) => {
      return request.addressee_profile_id === Number(profile.id);
    });
  }, [profile.id, sentFriendRequests]);

  return (
    <div className="profile-in-outing-container">
      <div className="profile-in-outing" style={{ display: 'flex' }}>
        <p style={{ color, paddingRight: 10 }}>
          {profile.name} with id {profile.id}
        </p>
        <p>({attendanceStatus})</p>
        {sameProfile ? null : (
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
        )}
      </div>
    </div>
  );
};

export default ProfileInOuting;
