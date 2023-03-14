import type {
  ApolloCache,
  DefaultContext,
  MutationFunctionOptions,
  OperationVariables,
} from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client';
import { createContext, useContext, useMemo } from 'react';
import {
  GENERATE_NOTIFICATION_STATUS,
  GET_NEW_NOTIFICATIONS_COUNT,
  GET_NOTIFICATIONS,
} from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';

interface NotificationController {
  count: number;
  notifications: any[];
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
}

export const NotificationContext = createContext({} as NotificationController);
export const NotificationProvider = (props: { children: React.ReactNode }) => {
  const {
    loading: countLoading,
    error: countError,
    data: countData,
  } = useQuery(GET_NEW_NOTIFICATIONS_COUNT);
  const {
    loading: notificationsLoading,
    error: notificationsError,
    data: notificationsData,
  } = useQuery(GET_NOTIFICATIONS);
  const [
    generateNotificationStatus,
    { data: statusData, loading: statusLoading, error: statusError },
  ] = useMutation(GENERATE_NOTIFICATION_STATUS, {
    refetchQueries: [
      { query: GET_NOTIFICATIONS },
      { query: GET_NEW_NOTIFICATIONS_COUNT },
    ],
    awaitRefetchQueries: true,
  });

  if (countError) logApolloError(countError);
  if (notificationsError) logApolloError(notificationsError);
  if (statusError) logApolloError(statusError);

  const count = useMemo(() => {
    if (countData) {
      return countData.getNewNotificationCount;
    }
  }, [countData]);
  const notifications = useMemo(() => {
    if (notificationsData) {
      return notificationsData.getAllNotifications;
    }
  }, [notificationsData]);

  return (
    <NotificationContext.Provider
      value={{ count, notifications, generateNotificationStatus }}
    >
      {props.children}
    </NotificationContext.Provider>
  );
};

export function useNotificationContext() {
  return useContext(NotificationContext);
}
