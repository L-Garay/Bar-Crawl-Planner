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
}

// NOTE I think having these querries in a context, is causing them to be called A LOT
// as in it appears whenever you navigate to a page that is wrapped in this provider, it triggers the querries
// TODO look into ways to prevent this using the apollo cache (refetch policies, etc)
// basically, if the request is the exact same and the data is the exact same it shouldn't refetch (ideally)
export const NotificationContext = createContext({} as NotificationController);
export const NotificationProvider = (props: { children: React.ReactNode }) => {
  const { error: countError, data: countData } = useQuery(
    GET_NEW_NOTIFICATIONS_COUNT
  );
  const { error: sentRequestError, data: sentRequestData } = useQuery(
    GET_SENT_FRIEND_REQUESTS
  );
  const { error: friendRequestError, data: friendRequestData } =
    useQuery(GET_FRIEND_REQUESTS);
  const { error: notificationsError, data: notificationsData } =
    useQuery(GET_NOTIFICATIONS);
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
      }}
    >
      {props.children}
    </NotificationContext.Provider>
  );
};

export function useNotificationContext() {
  return useContext(NotificationContext);
}
