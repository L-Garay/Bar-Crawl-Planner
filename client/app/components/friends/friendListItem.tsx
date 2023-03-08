export type FriendListItemProps = {
  requestor_profile_id: number;
  addressee_profile_id: number;
  frienshipStatus_friendship_relation: Record<string, any>[];
};

export const FriendListItem = ({
  requestor_profile_id,
  addressee_profile_id,
  frienshipStatus_friendship_relation,
}: FriendListItemProps) => {
  return (
    <div className="friend-list-item-container">
      <small className="friend-list-item" style={{ paddingRight: 10 }}>
        Requestor: {requestor_profile_id}
      </small>
      <small className="friend-list-item" style={{ paddingRight: 10 }}>
        Addressee: {addressee_profile_id}
      </small>
      <small className="friend-list-item" style={{ paddingRight: 10 }}>
        Modifier: {frienshipStatus_friendship_relation[0].modifier_profile_id}
      </small>
      <small className="friend-list-item" style={{ paddingRight: 10 }}>
        Status: {frienshipStatus_friendship_relation[0].status_code}
      </small>
      <small className="friend-list-item">
        Created at: {frienshipStatus_friendship_relation[0].created_at}
      </small>
    </div>
  );
};

export default FriendListItem;
