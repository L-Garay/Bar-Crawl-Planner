import moment from 'moment';
import { useMemo } from 'react';
import { ClosedEnvelope, OpenEnvelope } from '../svgs/envelopes';

export type OutingNotificationProps = {
  created_at: string;
  notification_addressee_relation: {
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
};

export const OutingNotification = ({
  created_at,
  sender_profile_id,
  type_code,
  notification_addressee_relation,
  notification_relation,
}: OutingNotificationProps) => {
  const hasJoined = useMemo(() => type_code === 'OJ', [type_code]);
  const relativeTime = useMemo(
    () => moment(created_at).fromNow(),
    [created_at]
  );
  // TODO need to add outing id to the notification so we can then fetch it and use it's name in the notification
  const { name } = notification_addressee_relation;
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

  return (
    <div className="notification-card-container">
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
