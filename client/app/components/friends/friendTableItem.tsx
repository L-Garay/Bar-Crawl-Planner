import { useMemo, useState } from 'react';
import MinusCircle from '../svgs/minusCircle';
import PlusCircle from '../svgs/plusCircle';

export type FriendTableItemProps = {
  userId: number;
  friend: Record<string, any>;
  addFriend: (accountId: number) => void;
  removeFriend: (accountId: number) => void;
  accountIds: number[];
};

export const FriendTableItem = ({
  userId,
  friend,
  addFriend,
  removeFriend,
  accountIds,
}: FriendTableItemProps) => {
  // can use this to determine if they are hovering over either plus or minus icon
  const [isHoveringIcon, setIsHoveringIcon] = useState<boolean>(false);
  const {
    id: addressee_id,
    name: addressee_name,
    account_Id: addressee_account_Id,
  } = friend.addressee_profile_relation;

  const {
    id: requestor_id,
    name: requestor_name,
    account_Id: requestor_account_Id,
  } = friend.requestor_profile_relation;

  const friendId = userId === addressee_id ? requestor_id : addressee_id;
  const nameToShow = userId === addressee_id ? requestor_name : addressee_name;

  const alreadyAdded = useMemo(() => {
    return accountIds.includes(friendId);
  }, [accountIds, friendId]);
  console.log('alreadyAdded', alreadyAdded);

  return (
    <div
      className="friend-list-item-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        background: alreadyAdded ? 'lightgray' : undefined,
      }}
    >
      <p
        className="friend-list-item"
        style={{ paddingRight: 10, marginTop: 5, marginBottom: 5 }}
      >
        {nameToShow}
      </p>
      {alreadyAdded ? (
        <span
          className="plus-icon-wrapper"
          onMouseEnter={() => setIsHoveringIcon(true)}
          onMouseLeave={() => setIsHoveringIcon(false)}
          onClick={() => {
            console.log('should be adding friend');

            removeFriend(friendId);
          }}
        >
          <MinusCircle
            pathId={friendId!}
            stroke={isHoveringIcon ? 'lightseagreen' : undefined}
          />
        </span>
      ) : (
        <span
          className="plus-icon-wrapper"
          onMouseEnter={() => setIsHoveringIcon(true)}
          onMouseLeave={() => setIsHoveringIcon(false)}
          onClick={() => {
            addFriend(friendId);
          }}
        >
          <PlusCircle
            pathId={friendId!}
            stroke={isHoveringIcon ? 'lightcoral' : undefined}
          />
        </span>
      )}
    </div>
  );
};

export default FriendTableItem;
