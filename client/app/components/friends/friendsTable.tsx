import { useMutation, useQuery } from '@apollo/client';
import {
  GET_ALL_FRIENDSHIPS,
  GET_PROFILES_IN_OUTING,
  SEND_OUTING_INVITES,
} from '~/constants/graphqlConstants';
import FriendTableItem from './friendTableItem';
import { useEffect, useState } from 'react';
import logApolloError from '~/utils/getApolloError';
import type {
  FriendshipData,
  PartialProfilesInOuting,
} from '~/types/sharedTypes';

export type FriendsTableProps = {
  userId: number;
  outingId: number;
  outingName: string;
  startDateAndTime: string;
  pendingProfiles: PartialProfilesInOuting[];
  acceptedProfiles: PartialProfilesInOuting[];
};

const FriendsTable = ({
  userId,
  outingId,
  outingName,
  startDateAndTime,
  acceptedProfiles,
  pendingProfiles,
}: FriendsTableProps) => {
  const [accountIds, setAccountIds] = useState<number[]>([]);
  const [friends, setFriends] = useState<FriendshipData[]>([]);
  const [hasFriendQueryError, setHasFriendQueryError] =
    useState<boolean>(false);
  const [hasInviteError, setHasInviteError] = useState<boolean>(false);

  useQuery(GET_ALL_FRIENDSHIPS, {
    onCompleted: (data) => {
      setFriends(data.getAllFriendships);
    },
    onError: (err) => {
      logApolloError(err);
      setHasFriendQueryError(true);
    },
  });

  const [inviteFriends] = useMutation(SEND_OUTING_INVITES, {
    refetchQueries: [GET_PROFILES_IN_OUTING],
    onError: (err) => {
      logApolloError(err);
      setHasInviteError(true);
    },
  });

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

  useEffect(() => {
    const errorTimeout = setTimeout(() => {
      setHasInviteError(false);
    }, 5000);

    return () => clearTimeout(errorTimeout);
  }, [hasInviteError]);

  return (
    <div className="friends-table-container">
      <div className="box">
        {hasFriendQueryError && (
          <p>There was a problem getting your friendships</p>
        )}
        {friends.length == 0 && !hasFriendQueryError && <p>No friends yet</p>}
        {friends.length && !hasFriendQueryError ? (
          <>
            <div className="friends-table-header">
              <h4>Friends</h4>
              <small># of friends added: {accountIds.length}</small>
            </div>
            <div className="friends-table">
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
          </>
        ) : null}
      </div>
      {hasInviteError && (
        <div className="invite-error">
          <p>
            Unable to send invitation(s), if problem continues contact support.
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendsTable;
