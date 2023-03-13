import { useMutation } from '@apollo/client';
import moment from 'moment';
import { useMemo } from 'react';
import { GENERATE_NOTIFICATION_STATUS } from '~/constants/graphqlConstants';
import { ClosedEnvelope, OpenEnvelope } from '../svgs/envelopes';

export type OutingNotificationProps = {
  id: string;
  created_at: string;
  notification_addressee_relation: {
    name: string;
  };
  notification_sender_relation: {
    name: string;
  };
  sender_profile_id: string;
  type_code: string;
  notification_relation: [
    {
      status_code: string;
      created_at: string;
    }
  ];
} & {
  setnotificationIndex: (index: number) => void;
  index: number;
};

export const OutingNotification = ({
  id,
  created_at,
  sender_profile_id,
  type_code,
  notification_addressee_relation,
  notification_sender_relation,
  notification_relation,
  setnotificationIndex,
  index,
}: OutingNotificationProps) => {
  const hasJoined = useMemo(() => type_code === 'OJ', [type_code]);
  const relativeTime = useMemo(
    () => moment(created_at).fromNow(),
    [created_at]
  );

  const [generateNotificationStatus] = useMutation(
    GENERATE_NOTIFICATION_STATUS
  );
  // TODO need to add outing id to the notification so we can then fetch it and use it's name in the notification
  const { name } = notification_sender_relation;
  const { status_code, created_at: notification_created_at } =
    notification_relation[0];
  const title = hasJoined
    ? `${name} has joined (outing name)`
    : `${name} has left (outing name)`;
  const iconToRender =
    status_code === 'S' ? (
      <ClosedEnvelope pathId={created_at} size="small" />
    ) : (
      <OpenEnvelope pathId={created_at} size="small" />
    );

  // TODO when a user clicks on the notification card, we need to create a new notification status to indiciate that this notification was opened
  return (
    <div
      className="notification-card-container"
      onClick={() => {
        setnotificationIndex(index);
        // the addresse in this status is the sender of the original notification
        // the sender in this status is the user who received this notification
        // only create status if the notification has not been opened yet
        if (status_code === 'S') {
          generateNotificationStatus({
            variables: {
              addressee_profile_id: sender_profile_id,
              type_code,
              status_code: 'O',
              created_at,
              id,
            },
          });
        }
      }}
    >
      <div className="notification-card">
        <div className="notification-icon">{iconToRender}</div>
        <div className="notification-title">
          <h5>{title}</h5>
        </div>
        <div className="notification-body">
          <p>{relativeTime}</p>
        </div>
      </div>
    </div>
  );
};
