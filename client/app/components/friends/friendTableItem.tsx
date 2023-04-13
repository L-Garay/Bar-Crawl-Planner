import { useMemo, useState } from 'react';
import MinusCircle from '../svgs/minusCircle';
import PlusCircle from '../svgs/plusCircle';
import GradientCheck from '~/assets/gradient-check32px.png';
import type {
  FriendshipData,
  PartialProfilesInOuting,
} from '~/types/sharedTypes';

export type FriendTableItemProps = {
  userId: number;
  friend: FriendshipData;
  addFriend: (accountId: number) => void;
  removeFriend: (accountId: number) => void;
  accountIds: number[];
  pendingProfiles: PartialProfilesInOuting[];
  acceptedProfiles: PartialProfilesInOuting[];
};

export const FriendTableItem = ({
  userId,
  friend,
  addFriend,
  removeFriend,
  accountIds,
  pendingProfiles,
  acceptedProfiles,
}: FriendTableItemProps) => {
  const [isHoveringIcon, setIsHoveringIcon] = useState<boolean>(false);
  const { id: addressee_id, name: addressee_name } =
    friend.addressee_profile_relation;

  const { id: requestor_id, name: requestor_name } =
    friend.requestor_profile_relation;

  const friendId = userId === addressee_id ? requestor_id : addressee_id;
  const nameToShow = userId === addressee_id ? requestor_name : addressee_name;

  const alreadySelected = useMemo(() => {
    return accountIds.includes(friendId);
  }, [accountIds, friendId]);

  const alreadyAdded =
    pendingProfiles.some((profile) => profile.id == friendId) ||
    acceptedProfiles.some((profile) => profile.id == friendId);

  return (
    <div
      className="friend-list-item-container"
      // NOTE is this considered bad practice to use inline styles?
      // the style defined in the css will act as the default, and then we can overwrite it here
      style={{
        background: alreadySelected ? 'lightgray' : undefined,
      }}
    >
      <p className="friend-name">{nameToShow}</p>
      <>
        {alreadyAdded ? (
          <img
            src={GradientCheck}
            alt="check mark inside circle with color gradient"
            height={20}
            width={20}
          />
        ) : (
          <div>
            {alreadySelected ? (
              <span
                className="plus-icon-wrapper"
                onMouseEnter={() => setIsHoveringIcon(true)}
                onMouseLeave={() => setIsHoveringIcon(false)}
                onClick={() => removeFriend(friendId)}
              >
                <MinusCircle
                  pathId={friendId!.toString()}
                  stroke={isHoveringIcon ? 'lightseagreen' : undefined}
                />
              </span>
            ) : (
              <span
                className="plus-icon-wrapper"
                onMouseEnter={() => setIsHoveringIcon(true)}
                onMouseLeave={() => setIsHoveringIcon(false)}
                onClick={() => addFriend(friendId)}
              >
                <PlusCircle
                  pathId={friendId!.toString()}
                  stroke={isHoveringIcon ? 'lightcoral' : undefined}
                />
              </span>
            )}
          </div>
        )}
      </>
    </div>
  );
};

export default FriendTableItem;
