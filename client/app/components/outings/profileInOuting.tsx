import { useMemo } from 'react';

export type ProfileInOutingProps = {
  profile: Record<string, any>;
  attendanceStatus: string;
};

export const ProfileInOuting = ({
  profile,
  attendanceStatus,
}: ProfileInOutingProps) => {
  const color = useMemo(() => {
    if (attendanceStatus === 'Accepted') return 'green';
    if (attendanceStatus === 'Pending') return 'grey';
    if (attendanceStatus === 'Declined') return 'red';
    else return 'black';
  }, [attendanceStatus]);

  return (
    <div className="profile-in-outing-container">
      <div className="profile-in-outing" style={{ display: 'flex' }}>
        <p style={{ color, paddingRight: 10 }}>
          {profile.name} with id {profile.id}
        </p>
        <p>({attendanceStatus})</p>
      </div>
    </div>
  );
};

export default ProfileInOuting;
