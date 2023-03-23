import { useMutation } from '@apollo/client';
import { useLazyQuery } from '@apollo/client';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import {
  GET_NEW_NOTIFICATIONS_COUNT,
  GET_NOTIFICATIONS,
  GET_OUTING,
  OPEN_NOTIFICATION,
} from '~/constants/graphqlConstants';
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
      notification_created_at: string;
      id: number;
    }
  ];
  outing_id: number;
} & {
  setnotificationIndex: (index: number) => void;
  index: number;
  selectedNotification: any;
  // openNotification: (
  //   options?:
  //     | MutationFunctionOptions<
  //         any,
  //         OperationVariables,
  //         DefaultContext,
  //         ApolloCache<any>
  //       >
  //     | undefined
  // ) => Promise<any>;
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
}: NotificationCardProps) => {
  const [getOuting, { data: outingData }] = useLazyQuery(GET_OUTING);

  const [openNotification] = useMutation(OPEN_NOTIFICATION, {
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

  const relativeTime = useMemo(
    () => moment(created_at).fromNow(),
    [created_at]
  );

  const { name } = notification_sender_relation;
  const { status_code } =
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
          openNotification({
            variables: {
              type_code,
              notification_created_at: created_at,
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
