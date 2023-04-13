import { useMutation } from '@apollo/client';
import { useNavigate } from '@remix-run/react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  CONNECT_PROFILE,
  DISCONNECT_PROFILE,
  GET_PENDING_OUTINGS,
  GET_PENDING_OUTINGS_COUNT,
} from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';

export type OutingInviteProps = {
  creatorName: string;
  outingName: string;
  startDateAndTime: string;
  outingId: number;
  profileId: number;
};

const OutingInvite = ({
  creatorName,
  outingName,
  startDateAndTime,
  outingId,
  profileId,
}: OutingInviteProps) => {
  const navigate = useNavigate();
  const [showError, setShowError] = useState<boolean>(false);
  const [connectUserToOuting] = useMutation(CONNECT_PROFILE, {
    onError: (error) => {
      logApolloError(error);
      setShowError(true);
    },
    onCompleted: (data) => {
      navigate(`/outings/my-outings/${data.ConnectUserWithOuting.id}`);
    },
  });

  const [disconnectUserFromOuting] = useMutation(DISCONNECT_PROFILE, {
    refetchQueries: [GET_PENDING_OUTINGS, GET_PENDING_OUTINGS_COUNT],
    onError: (error) => {
      logApolloError(error);
      setShowError(true);
    },
  });

  useEffect(() => {
    const errorTimeout = setTimeout(() => {
      setShowError(false);
    }, 5000);

    return () => clearTimeout(errorTimeout);
  }, [showError]);

  return (
    <div
      className="outing-invite"
      style={{ margin: '10px 0', padding: 10, border: '1px solid black' }}
    >
      <p>
        {creatorName} has invited you the outing: {outingName}.
      </p>
      <p>It is scheduled to start: {moment().to(startDateAndTime)}. </p>
      <div className="flex">
        <p className="label">Do you accept?</p>
        <button
          onClick={() =>
            connectUserToOuting({
              variables: {
                outing_id: outingId,
                profile_id: profileId,
              },
            })
          }
        >
          Accept
        </button>
        <button
          onClick={() =>
            disconnectUserFromOuting({
              variables: {
                outing_id: outingId,
                profile_id: profileId,
              },
            })
          }
        >
          Decline
        </button>
      </div>
      <div className="error-message">
        {showError && <p>We are unable to record your answer at this time.</p>}
      </div>
    </div>
  );
};

export default OutingInvite;
