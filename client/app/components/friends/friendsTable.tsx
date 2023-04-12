import { useMutation, useQuery } from '@apollo/client';
import {
  GET_ALL_FRIENDSHIPS,
  GET_PROFILES_IN_OUTING,
  SEND_OUTING_INVITES,
} from '~/constants/graphqlConstants';
import FriendTableItem from './friendTableItem';
import { useState } from 'react';

export type FriendsTableProps = {
  userId: number;
  outingId: number;
  outingName: string;
  startDateAndTime: string;
  pendingProfiles: any[];
  acceptedProfiles: any[];
};

const FriendsTable = ({
  userId,
  outingId,
  outingName,
  startDateAndTime,
  acceptedProfiles,
  pendingProfiles,
}: FriendsTableProps) => {
  const { data: friendsData } = useQuery(GET_ALL_FRIENDSHIPS);
  const friends = friendsData ? friendsData.getAllFriendships : [];

  const [inviteFriends, { data: inviteData }] = useMutation(
    SEND_OUTING_INVITES,
    {
      refetchQueries: [GET_PROFILES_IN_OUTING], // don't think this will work since the original query for the parent component comes from the loader, and so the updated/refecthed data will not be made available unless the page refreshes
    }
  );

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
                  userId={userId}
                  friend={friend}
                  addFriend={addFriend}
                  removeFriend={removeFriend}
                  accountIds={accountIds}
                  pendingProfiles={pendingProfiles}
                  acceptedProfiles={acceptedProfiles}
                />
              ))}
            </>
          </div>
          <div className="friends-table-button">
            {/* TODO create mutation to send outing invites to friends */}
            {/* NOTE try to reuse as much of the sendOutingInvitesAndCreate mutation as possible. As in, just as the GetBlockedAccountEmails code was split out, see if you can do the same with the code that gets the emails using the account ids */}
            <button
              disabled={accountIds.length == 0}
              onClick={() => {
                inviteFriends({
                  variables: {
                    outing_id: outingId,
                    start_date_and_time: startDateAndTime,
                    account_Ids: accountIds,
                    outing_name: outingName,
                  },
                });
                setAccountIds([]);
              }}
            >
              Invite Friends
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsTable;
