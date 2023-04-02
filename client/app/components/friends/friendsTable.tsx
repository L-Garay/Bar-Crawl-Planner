import { useQuery } from '@apollo/client';
import { GET_ALL_FRIENDSHIPS } from '~/constants/graphqlConstants';
import FriendTableItem from './friendTableItem';
import { useState } from 'react';

export type FriendsTableProps = {
  user_id: number;
};

const FriendsTable = ({ user_id }: FriendsTableProps) => {
  const { data: friendsData } = useQuery(GET_ALL_FRIENDSHIPS);
  console.log('friends', friendsData);
  const friends = friendsData ? friendsData.getAllFriendships : [];
  console.log(user_id);

  // for added friends, we can store their account ids here and then when it's time to invite them we can just look up their accounts and grab their emails
  const [accountIds, setAccountIds] = useState<number[]>([]);
  const addFriend = (accountId: number) => {
    if (!accountIds.includes(accountId)) {
      setAccountIds([...accountIds, accountId]);
    }
  };
  const removeFriend = (accountId: number) => {
    if (accountIds.includes(accountId)) {
      const newAccountIds = accountIds.filter((id) => id !== accountId);
      setAccountIds(newAccountIds);
    }
  };
  console.log('accountIds', accountIds);

  return (
    <div
      className="friends-table-container"
      style={{
        width: 250,
        marginLeft: 100,
      }}
    >
      {friends.length == 0 ? (
        <p>No friends yet</p>
      ) : (
        <div style={{ outline: '1px solid black', padding: 10 }}>
          <div
            className="friends-table-header"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <h4 style={{ marginRight: 10 }}>Friends</h4>
            <small># of friends added: {accountIds.length}</small>
          </div>
          <div className="friends-table" style={{ minHeight: 100 }}>
            <>
              {friends.map((friend: any) => (
                <FriendTableItem
                  key={friend.id}
                  user_id={user_id}
                  friend={friend}
                  addFriend={addFriend}
                  removeFriend={removeFriend}
                  accountIds={accountIds}
                />
              ))}
            </>
          </div>
          <div className="friends-table-button">
            {/* TODO create mutation to send outing invites to friends */}
            <button>Invite Friends</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsTable;
