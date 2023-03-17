import type {
  ApolloCache,
  DefaultContext,
  MutationFunctionOptions,
  OperationVariables,
} from '@apollo/client';
import { useLazyQuery } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { createContext, useContext, useMemo, useState } from 'react';
import {
  GENERATE_NOTIFICATION_STATUS,
  GET_FRIEND_REQUESTS,
  GET_NEW_NOTIFICATIONS_COUNT,
  GET_NOTIFICATIONS,
  GET_SENT_FRIEND_REQUESTS,
} from '~/constants/graphqlConstants';
import logApolloError from '~/utils/getApolloError';

interface NotificationController {
  count: number;
  notifications: any[];
  sentFriendRequests: any[];
  receivedFriendRequests: any[];
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
  setShouldQuery: (shouldQuery: boolean) => void;
}

// NOTE I think having these querries in a context, is causing them to be called A LOT
// as in it appears whenever you navigate to a page that is wrapped in this provider, it triggers the querries
// TODO look into ways to prevent this using the apollo cache (refetch policies, etc)
// basically, if the request is the exact same and the data is the exact same it shouldn't refetch (ideally)
export const NotificationContext = createContext({} as NotificationController);
export const NotificationProvider = (props: { children: React.ReactNode }) => {
  const [shouldQuery, setShouldQuery] = useState<boolean>(false);

  const [getNewNotificationCount, { error: countError, data: countData }] =
    useLazyQuery(GET_NEW_NOTIFICATIONS_COUNT);
  const [
    getSentFriendRequests,
    { error: sentRequestError, data: sentRequestData },
  ] = useLazyQuery(GET_SENT_FRIEND_REQUESTS);
  const [
    getFriendRequests,
    { error: friendRequestError, data: friendRequestData },
  ] = useLazyQuery(GET_FRIEND_REQUESTS);
  const [
    getAllNotifications,
    {
      error: notificationsError,
      data: notificationsData,
      loading: notificationsLoading,
    },
  ] = useLazyQuery(GET_NOTIFICATIONS);
  const [generateNotificationStatus, { error: statusError }] = useMutation(
    GENERATE_NOTIFICATION_STATUS,
    {
      refetchQueries: [
        { query: GET_NOTIFICATIONS },
        { query: GET_NEW_NOTIFICATIONS_COUNT },
      ],
      awaitRefetchQueries: true,
    }
  );

  if (shouldQuery) {
    getNewNotificationCount();
    getSentFriendRequests();
    getFriendRequests();
    getAllNotifications();
    setShouldQuery(false);
  }

  console.log(
    'Notifications query called and is loading:',
    notificationsLoading,
    'Noticiations data:',
    notificationsData
  );

  // NOTE when a user logs out, these all get triggered because as noted above, when navigiating it seems that the querries are called
  // and so when a user logs out, it 'navigates' to the resource route and then the login page and we get network errros saying there was an error attempting to fetch resources (even though the two pages in question are not wrapped in the provider)
  // TODO I've suprressed the UI error boundary by properly catching the network error, but this is still a problem that needs to be addressed
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
  const sentFriendRequests = useMemo(() => {
    if (sentRequestData) {
      return sentRequestData.getSentFriendRequests;
    }
  }, [sentRequestData]);
  const receivedFriendRequests = useMemo(() => {
    if (friendRequestData) {
      return friendRequestData.getFriendRequests;
    }
  }, [friendRequestData]);

  return (
    <NotificationContext.Provider
      value={{
        count,
        notifications,
        sentFriendRequests,
        receivedFriendRequests,
        generateNotificationStatus,
        setShouldQuery,
      }}
    >
      {props.children}
    </NotificationContext.Provider>
  );
};

export function useNotificationContext() {
  return useContext(NotificationContext);
}
