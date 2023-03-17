import type {
  ApolloCache,
  DefaultContext,
  MutationFunctionOptions,
  OperationVariables,
} from '@apollo/client';
import { useLazyQuery } from '@apollo/client';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { GET_OUTING } from '~/constants/graphqlConstants';
import { ClosedEnvelope, OpenEnvelope } from '../svgs/envelopes';

export type NotificationCardProps = {
  id: string;
  created_at: string;
  notification_addressee_relation: {
    id: number;
    name: string;
  };
  notification_sender_relation: {
    id: number;
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
  outing_id: number;
} & {
  setnotificationIndex: (index: number) => void;
  index: number;
  selectedNotification: any;
  generateNotificationStatus: (
    options?:
      | MutationFunctionOptions<
          any,
          OperationVariables,
          DefaultContext,
          ApolloCache<any>
        >
      | undefined
  ) => Promise<any>;
};

export const NotificationCard = ({
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
  outing_id,
  generateNotificationStatus,
}: NotificationCardProps) => {
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

  const relativeTime = useMemo(
    () => moment(created_at).fromNow(),
    [created_at]
  );

  const { name } = notification_sender_relation;
  const { status_code, created_at: notification_created_at } =
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

  const isOpened = useMemo(() => status_code !== 'S', [status_code]);
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
