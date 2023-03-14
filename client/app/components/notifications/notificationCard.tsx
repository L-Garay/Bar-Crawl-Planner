import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { useNotificationContext } from '~/contexts/notificationContext';
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
  selectedNotification: any;
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
  selectedNotification,
}: OutingNotificationProps) => {
  const { generateNotificationStatus } = useNotificationContext();

  const relativeTime = useMemo(
    () => moment(created_at).fromNow(),
    [created_at]
  );

  // TODO need to add outing id to the notification so we can then fetch it and use it's name in the notification
  const { name } = notification_sender_relation;
  const { status_code, created_at: notification_created_at } =
    notification_relation[notification_relation.length - 1];

  const title =
    type_code === 'OJ'
      ? `${name} has joined (outing name)`
      : `${name} sent you a friend request`;

  const isOpened = useMemo(() => status_code === 'O', [status_code]);
  const iconToRender = isOpened ? (
    <OpenEnvelope pathId={created_at} size="small" />
  ) : (
    <ClosedEnvelope pathId={created_at} size="small" />
  );

  const isSelected = useMemo(() => {
    if (selectedNotification) {
      return id === selectedNotification.id;
    }
  }, [selectedNotification, id]);

  // Not a fan of this, there's got to be a better way to dynamically set css variables
  // or would it be better to just create the different states/themes/variations in SCSS and then programatically add/remove classes?
  useEffect(() => {
    if (isOpened) {
      document
        .getElementById(id)
        ?.style.setProperty('--notification-bg', 'white');
    }
  }, [isOpened, id]);

  useEffect(() => {
    if (isSelected) {
      document
        .getElementById(id)
        ?.style.setProperty('--notification-outline-color', 'lightseagreen');
    } else {
      document
        .getElementById(id)
        ?.style.setProperty('--notification-outline-color', 'black');
    }
  }, [isSelected, id]);

  return (
    <div
      id={id}
      className="notification-card-container"
      onClick={() => {
        setnotificationIndex(index);
        if (status_code === 'S') {
          generateNotificationStatus({
            variables: {
              type_code,
              status_code: 'O',
              created_at,
              id: Number(id),
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
