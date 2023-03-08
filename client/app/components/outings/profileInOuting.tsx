import { useMemo } from 'react';

export type ProfileInOutingProps = {
  profile: Record<string, any>;
  addFriend: ({ variables }: { variables: any }) => void;
  attendanceStatus: string;
  currentUser: number;
};

export const ProfileInOuting = ({
  profile,
  addFriend,
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

  // TODO check to see if already friends, and if so hide the add friend button

  return (
    <div className="profile-in-outing-container">
      <div className="profile-in-outing" style={{ display: 'flex' }}>
        <p style={{ color, paddingRight: 10 }}>
          {profile.name} with id {profile.id}
        </p>
        <p>({attendanceStatus})</p>
        {sameProfile ? null : (
          <button
            onClick={() => {
              addFriend({
                variables: {
                  addressee_profile_id: profile.id,
                },
              });
            }}
          >
            Add Friend
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileInOuting;
