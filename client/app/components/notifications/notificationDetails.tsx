import { useLazyQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import {
  ACCEPT_FRIEND_REQUEST,
  DECLINE_FRIEND_REQUEST,
  GET_NEW_NOTIFICATIONS_COUNT,
  GET_NOTIFICATIONS,
  GET_OUTING,
} from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';
import type { NotificationCardProps } from './notificationCard';

export type NotificationDetailsProps = Omit<
  NotificationCardProps,
  'setnotificationIndex' | 'index' | 'selectedNotification'
>;

export const NotificationDetails = ({
  id,
  created_at,
  sender_profile_id,
  type_code,
  notification_addressee_relation,
  notification_sender_relation,
  notification_relation,
  outing_id,
}: // generateNotificationStatus,
NotificationDetailsProps) => {
  const [getOuting, { data: outingData }] = useLazyQuery(GET_OUTING);

  const [declineFriendRequest] = useMutation(DECLINE_FRIEND_REQUEST, {
    refetchQueries: [
      { query: GET_NOTIFICATIONS },
      { query: GET_NEW_NOTIFICATIONS_COUNT },
    ],
    awaitRefetchQueries: true,
  });
  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST, {
    refetchQueries: [
      { query: GET_NOTIFICATIONS },
      { query: GET_NEW_NOTIFICATIONS_COUNT },
    ],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (outing_id) {
      getOuting({
        variables: {
          id: Number(outing_id),
        },
      });
    }
  }, [outing_id, getOuting]);

  const notificationDate = useMemo(
    () => moment(created_at).fromNow(),
    [created_at]
  );

  const outingDate = useMemo(() => {
    if (outingData) {
      return moment().to(outingData.getOuting.start_date_and_time);
    }
  }, [outingData]);

  const { name } = notification_sender_relation;
  const { id: addressee_id } = notification_addressee_relation;
  const { status_code, notification_created_at } =
    notification_relation[notification_relation.length - 1];
  const title = useMemo(() => {
    if (name && outingData) {
      return `${name} has joined ${outingData.getOuting.name}`;
    } else if (name && !outingData && type_code === 'FR') {
      return `${name} has sent you a friend request`;
    } else if (name && !outingData && type_code === 'FRR') {
      return `${name} has accepted your friend request`;
    }
  }, [name, outingData, type_code]);

  const handleAccept = async () => {
    try {
      await acceptFriendRequest({
        variables: {
          sender_profile_id: Number(sender_profile_id),
          addressee_profile_id: Number(addressee_id),
          notification_id: Number(id),
          notification_created_at,
          // can infer the type_codes and status_code in the machine given the state and event
        },
      });
    } catch (error) {
      logApolloError(error);
    }
  };

  const handleDecline = async () => {
    try {
      await declineFriendRequest({
        variables: {
          notification_id: Number(id),
          notification_created_at,
        },
      });
    } catch (error) {
      logApolloError(error);
    }
  };

  return (
    <div className="main-notification-container">
      <div className="notification-details">
        <h5>{title}</h5>
        <p>{notificationDate}</p>
        {type_code === 'OJ' && outingData ? (
          <div>
            {' '}
            <p>Outing Details</p>
            <p>
              {name} has joined {outingData.getOuting.name}, scheduled to take
              place {outingDate}!
            </p>
            <p>
              To view the outing, please click{' '}
              <a href={`/outings/my-outings/${outing_id}`}>here</a>.
            </p>
          </div>
        ) : type_code === 'FR' ? (
          <div>
            {' '}
            <p>Friend Request Details</p>
            {status_code === 'A' || status_code === 'D' ? (
              <p>Your response has been submitted!</p>
            ) : (
              <>
                <p>How would you like to respond?</p>
                <div>
                  <button onClick={handleAccept}>Accept</button>
                  <button onClick={handleDecline}>Decline</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <p>
            Click <a href="/friends">here</a> to go to your Friends page
          </p>
        )}
      </div>
    </div>
  );
};
