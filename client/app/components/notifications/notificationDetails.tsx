import { useLazyQuery } from '@apollo/client';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { GET_OUTING } from '~/constants/graphqlConstants';
import type { OutingNotificationProps } from './notificationCard';

export type NotificationDetailsProps = Omit<
  OutingNotificationProps,
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
}: NotificationDetailsProps) => {
  const [getOuting, { error: outingError, data: outingData }] =
    useLazyQuery(GET_OUTING);

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
  const { status_code, created_at: notification_created_at } =
    notification_relation[notification_relation.length - 1];
  const title = useMemo(() => {
    if (name && outingData) {
      return `${name} has joined ${outingData.getOuting.name}`;
    } else if (name && !outingData) {
      return `${name} has sent you a friend request`;
    }
  }, [name, outingData]);

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
        ) : (
          <div>
            {' '}
            <p>Friend Request Details</p>{' '}
          </div>
        )}
      </div>
    </div>
  );
};
