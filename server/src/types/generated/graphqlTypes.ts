import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Account = {
  __typename?: 'Account';
  created_at?: Maybe<Scalars['String']>;
  deactivated?: Maybe<Scalars['Boolean']>;
  deactivated_at?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  email_verified?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  phone_number?: Maybe<Scalars['String']>;
  profile?: Maybe<Profile>;
};

export type Friendship = {
  __typename?: 'Friendship';
  addressee_profile_id?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['String']>;
  frienshipStatus_friendship_relation?: Maybe<Array<Maybe<FriendshipStatus>>>;
  requestor_profile_id?: Maybe<Scalars['Int']>;
};

export type FriendshipStatus = {
  __typename?: 'FriendshipStatus';
  addressee_profile_id?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['String']>;
  modifier_profile_id?: Maybe<Scalars['Int']>;
  requestor_profile_id?: Maybe<Scalars['Int']>;
  status_code?: Maybe<Scalars['String']>;
};

export type LocationDetails = {
  __typename?: 'LocationDetails';
  business_status?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  expiration_date?: Maybe<Scalars['String']>;
  formatted_address?: Maybe<Scalars['String']>;
  formatted_phone_number?: Maybe<Scalars['String']>;
  html_attributions?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  icon_background_color?: Maybe<Scalars['String']>;
  icon_mask_base_uri?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
  open_periods?: Maybe<Array<Maybe<Scalars['String']>>>;
  photos_references?: Maybe<Array<Maybe<Scalars['String']>>>;
  place_id?: Maybe<Scalars['String']>;
  plus_compound_code?: Maybe<Scalars['String']>;
  plus_global_code?: Maybe<Scalars['String']>;
  price_level?: Maybe<Scalars['Int']>;
  rating?: Maybe<Scalars['Float']>;
  reviews?: Maybe<Array<Maybe<Scalars['String']>>>;
  state?: Maybe<Scalars['String']>;
  types?: Maybe<Array<Maybe<Scalars['String']>>>;
  url?: Maybe<Scalars['String']>;
  user_ratings_total?: Maybe<Scalars['Int']>;
  utc_offset_minutes?: Maybe<Scalars['Float']>;
  vicinity?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
  weekday_text?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  ConnectUserWithOuting?: Maybe<Outing>;
  CreateAccountAndProfile?: Maybe<Scalars['String']>;
  DisconnectUserWithOuting?: Maybe<Outing>;
  UpdateAccountBySocialPin?: Maybe<Account>;
  createAccount?: Maybe<Account>;
  createOuting?: Maybe<Outing>;
  createProfile?: Maybe<Profile>;
  deactivateUserAccount?: Maybe<Account>;
  deleteOuting?: Maybe<Scalars['String']>;
  generateNotificationStatus?: Maybe<NotificationStatus>;
  generateOutingNotification?: Maybe<Array<Maybe<Notification>>>;
  sendOutingInvites?: Maybe<Scalars['String']>;
  testAddFriend?: Maybe<FriendshipStatus>;
  updateOuting?: Maybe<Outing>;
  updateUserAccount?: Maybe<Account>;
};


export type MutationConnectUserWithOutingArgs = {
  outing_id: Scalars['Int'];
  profile_id: Scalars['Int'];
};


export type MutationCreateAccountAndProfileArgs = {
  email: Scalars['String'];
  name: Scalars['String'];
  picture: Scalars['String'];
  verified: Scalars['Boolean'];
};


export type MutationDisconnectUserWithOutingArgs = {
  outing_id: Scalars['Int'];
  profile_id: Scalars['Int'];
};


export type MutationUpdateAccountBySocialPinArgs = {
  email: Scalars['String'];
  profile_id: Scalars['Int'];
  social_pin: Scalars['String'];
};


export type MutationCreateAccountArgs = {
  email?: InputMaybe<Scalars['String']>;
  email_verified?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateOutingArgs = {
  created_at?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  place_ids?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  start_date_and_time?: InputMaybe<Scalars['String']>;
};


export type MutationCreateProfileArgs = {
  account_id?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  profile_img?: InputMaybe<Scalars['String']>;
};


export type MutationDeactivateUserAccountArgs = {
  id: Scalars['Int'];
};


export type MutationDeleteOutingArgs = {
  id: Scalars['Int'];
};


export type MutationGenerateNotificationStatusArgs = {
  created_at: Scalars['String'];
  id: Scalars['Int'];
  status_code: Scalars['String'];
  type_code: Scalars['String'];
};


export type MutationGenerateOutingNotificationArgs = {
  outing_id: Scalars['Int'];
};


export type MutationSendOutingInvitesArgs = {
  emails: Array<Scalars['String']>;
  outing_id: Scalars['Int'];
  start_date_and_time: Scalars['String'];
};


export type MutationTestAddFriendArgs = {
  addressee_profile_id: Scalars['Int'];
};


export type MutationUpdateOutingArgs = {
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
  start_date_and_time?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateUserAccountArgs = {
  email?: InputMaybe<Scalars['String']>;
  phone_number?: InputMaybe<Scalars['String']>;
};

export type Notification = {
  __typename?: 'Notification';
  addressee_profile_id?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  notification_addressee_relation?: Maybe<Profile>;
  notification_relation?: Maybe<Array<Maybe<NotificationStatus>>>;
  notification_sender_relation?: Maybe<Profile>;
  sender_profile_id?: Maybe<Scalars['Int']>;
  type_code?: Maybe<Scalars['String']>;
};

export type NotificationStatus = {
  __typename?: 'NotificationStatus';
  modified_at?: Maybe<Scalars['String']>;
  modifier_profile_id?: Maybe<Scalars['Int']>;
  notification_created_at?: Maybe<Scalars['String']>;
  notification_id?: Maybe<Scalars['Int']>;
  status_code?: Maybe<Scalars['String']>;
  type_code?: Maybe<Scalars['String']>;
};

export type Outing = {
  __typename?: 'Outing';
  accepted_profiles?: Maybe<Array<Maybe<Profile>>>;
  created_at?: Maybe<Scalars['String']>;
  creator_profile_id?: Maybe<Scalars['String']>;
  declined_profiles?: Maybe<Array<Maybe<Profile>>>;
  id?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  pending_profiles?: Maybe<Array<Maybe<Profile>>>;
  place_ids?: Maybe<Array<Maybe<Scalars['String']>>>;
  start_date_and_time?: Maybe<Scalars['String']>;
};

export type OutingProfileStates = {
  __typename?: 'OutingProfileStates';
  accepted_profiles?: Maybe<Array<Maybe<Profile>>>;
  declined_profiles?: Maybe<Array<Maybe<Profile>>>;
  pending_profiles?: Maybe<Array<Maybe<Profile>>>;
};

export type Profile = {
  __typename?: 'Profile';
  accepted_outings?: Maybe<Array<Maybe<Outing>>>;
  account?: Maybe<Account>;
  account_id?: Maybe<Scalars['Int']>;
  declined_outings?: Maybe<Array<Maybe<Outing>>>;
  friends?: Maybe<Array<Maybe<Profile>>>;
  friendsRelation?: Maybe<Array<Maybe<Profile>>>;
  id?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  pending_outings?: Maybe<Array<Maybe<Outing>>>;
  profile_img?: Maybe<Scalars['String']>;
  social_pin?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  accounts?: Maybe<Array<Maybe<Account>>>;
  getAccountByEmail?: Maybe<Account>;
  getAccountWithProfileData?: Maybe<Account>;
  getAllFriendships?: Maybe<Array<Maybe<Friendship>>>;
  getAllNotifications?: Maybe<Array<Maybe<Notification>>>;
  getAllOutings?: Maybe<Array<Maybe<Outing>>>;
  getNewNotificationCount?: Maybe<Scalars['Int']>;
  getOuting?: Maybe<Outing>;
  getProfilesInOuting?: Maybe<OutingProfileStates>;
  getUserAccount?: Maybe<Account>;
  profile?: Maybe<Profile>;
  profiles?: Maybe<Array<Maybe<Profile>>>;
  searchCity?: Maybe<Array<Maybe<LocationDetails>>>;
};


export type QueryGetAccountByEmailArgs = {
  email: Scalars['String'];
};


export type QueryGetAccountWithProfileDataArgs = {
  email: Scalars['String'];
};


export type QueryGetOutingArgs = {
  id: Scalars['Int'];
};


export type QueryGetProfilesInOutingArgs = {
  id: Scalars['Int'];
};


export type QuerySearchCityArgs = {
  city: Scalars['String'];
  locationType: Scalars['String'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Account: ResolverTypeWrapper<Account>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Friendship: ResolverTypeWrapper<Friendship>;
  FriendshipStatus: ResolverTypeWrapper<FriendshipStatus>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LocationDetails: ResolverTypeWrapper<LocationDetails>;
  Mutation: ResolverTypeWrapper<{}>;
  Notification: ResolverTypeWrapper<Notification>;
  NotificationStatus: ResolverTypeWrapper<NotificationStatus>;
  Outing: ResolverTypeWrapper<Outing>;
  OutingProfileStates: ResolverTypeWrapper<OutingProfileStates>;
  Profile: ResolverTypeWrapper<Profile>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Account: Account;
  Boolean: Scalars['Boolean'];
  Float: Scalars['Float'];
  Friendship: Friendship;
  FriendshipStatus: FriendshipStatus;
  Int: Scalars['Int'];
  LocationDetails: LocationDetails;
  Mutation: {};
  Notification: Notification;
  NotificationStatus: NotificationStatus;
  Outing: Outing;
  OutingProfileStates: OutingProfileStates;
  Profile: Profile;
  Query: {};
  String: Scalars['String'];
}>;

export type AccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = ResolversObject<{
  created_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deactivated?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deactivated_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email_verified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  phone_number?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FriendshipResolvers<ContextType = any, ParentType extends ResolversParentTypes['Friendship'] = ResolversParentTypes['Friendship']> = ResolversObject<{
  addressee_profile_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  frienshipStatus_friendship_relation?: Resolver<Maybe<Array<Maybe<ResolversTypes['FriendshipStatus']>>>, ParentType, ContextType>;
  requestor_profile_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FriendshipStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['FriendshipStatus'] = ResolversParentTypes['FriendshipStatus']> = ResolversObject<{
  addressee_profile_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifier_profile_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  requestor_profile_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LocationDetailsResolvers<ContextType = any, ParentType extends ResolversParentTypes['LocationDetails'] = ResolversParentTypes['LocationDetails']> = ResolversObject<{
  business_status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiration_date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  formatted_address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  formatted_phone_number?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  html_attributions?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  icon_background_color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  icon_mask_base_uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  open_periods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  photos_references?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  place_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  plus_compound_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  plus_global_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price_level?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  reviews?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  types?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user_ratings_total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  utc_offset_minutes?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vicinity?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weekday_text?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  ConnectUserWithOuting?: Resolver<Maybe<ResolversTypes['Outing']>, ParentType, ContextType, RequireFields<MutationConnectUserWithOutingArgs, 'outing_id' | 'profile_id'>>;
  CreateAccountAndProfile?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationCreateAccountAndProfileArgs, 'email' | 'name' | 'picture' | 'verified'>>;
  DisconnectUserWithOuting?: Resolver<Maybe<ResolversTypes['Outing']>, ParentType, ContextType, RequireFields<MutationDisconnectUserWithOutingArgs, 'outing_id' | 'profile_id'>>;
  UpdateAccountBySocialPin?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<MutationUpdateAccountBySocialPinArgs, 'email' | 'profile_id' | 'social_pin'>>;
  createAccount?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, Partial<MutationCreateAccountArgs>>;
  createOuting?: Resolver<Maybe<ResolversTypes['Outing']>, ParentType, ContextType, Partial<MutationCreateOutingArgs>>;
  createProfile?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType, Partial<MutationCreateProfileArgs>>;
  deactivateUserAccount?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<MutationDeactivateUserAccountArgs, 'id'>>;
  deleteOuting?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteOutingArgs, 'id'>>;
  generateNotificationStatus?: Resolver<Maybe<ResolversTypes['NotificationStatus']>, ParentType, ContextType, RequireFields<MutationGenerateNotificationStatusArgs, 'created_at' | 'id' | 'status_code' | 'type_code'>>;
  generateOutingNotification?: Resolver<Maybe<Array<Maybe<ResolversTypes['Notification']>>>, ParentType, ContextType, RequireFields<MutationGenerateOutingNotificationArgs, 'outing_id'>>;
  sendOutingInvites?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationSendOutingInvitesArgs, 'emails' | 'outing_id' | 'start_date_and_time'>>;
  testAddFriend?: Resolver<Maybe<ResolversTypes['FriendshipStatus']>, ParentType, ContextType, RequireFields<MutationTestAddFriendArgs, 'addressee_profile_id'>>;
  updateOuting?: Resolver<Maybe<ResolversTypes['Outing']>, ParentType, ContextType, RequireFields<MutationUpdateOutingArgs, 'id'>>;
  updateUserAccount?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, Partial<MutationUpdateUserAccountArgs>>;
}>;

export type NotificationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = ResolversObject<{
  addressee_profile_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  notification_addressee_relation?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType>;
  notification_relation?: Resolver<Maybe<Array<Maybe<ResolversTypes['NotificationStatus']>>>, ParentType, ContextType>;
  notification_sender_relation?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType>;
  sender_profile_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NotificationStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['NotificationStatus'] = ResolversParentTypes['NotificationStatus']> = ResolversObject<{
  modified_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  modifier_profile_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  notification_created_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notification_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OutingResolvers<ContextType = any, ParentType extends ResolversParentTypes['Outing'] = ResolversParentTypes['Outing']> = ResolversObject<{
  accepted_profiles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  creator_profile_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  declined_profiles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pending_profiles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  place_ids?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  start_date_and_time?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OutingProfileStatesResolvers<ContextType = any, ParentType extends ResolversParentTypes['OutingProfileStates'] = ResolversParentTypes['OutingProfileStates']> = ResolversObject<{
  accepted_profiles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  declined_profiles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  pending_profiles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfileResolvers<ContextType = any, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = ResolversObject<{
  accepted_outings?: Resolver<Maybe<Array<Maybe<ResolversTypes['Outing']>>>, ParentType, ContextType>;
  account?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType>;
  account_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  declined_outings?: Resolver<Maybe<Array<Maybe<ResolversTypes['Outing']>>>, ParentType, ContextType>;
  friends?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  friendsRelation?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pending_outings?: Resolver<Maybe<Array<Maybe<ResolversTypes['Outing']>>>, ParentType, ContextType>;
  profile_img?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  social_pin?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  accounts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Account']>>>, ParentType, ContextType>;
  getAccountByEmail?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryGetAccountByEmailArgs, 'email'>>;
  getAccountWithProfileData?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryGetAccountWithProfileDataArgs, 'email'>>;
  getAllFriendships?: Resolver<Maybe<Array<Maybe<ResolversTypes['Friendship']>>>, ParentType, ContextType>;
  getAllNotifications?: Resolver<Maybe<Array<Maybe<ResolversTypes['Notification']>>>, ParentType, ContextType>;
  getAllOutings?: Resolver<Maybe<Array<Maybe<ResolversTypes['Outing']>>>, ParentType, ContextType>;
  getNewNotificationCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  getOuting?: Resolver<Maybe<ResolversTypes['Outing']>, ParentType, ContextType, RequireFields<QueryGetOutingArgs, 'id'>>;
  getProfilesInOuting?: Resolver<Maybe<ResolversTypes['OutingProfileStates']>, ParentType, ContextType, RequireFields<QueryGetProfilesInOutingArgs, 'id'>>;
  getUserAccount?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType>;
  profile?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType>;
  profiles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  searchCity?: Resolver<Maybe<Array<Maybe<ResolversTypes['LocationDetails']>>>, ParentType, ContextType, RequireFields<QuerySearchCityArgs, 'city' | 'locationType'>>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Account?: AccountResolvers<ContextType>;
  Friendship?: FriendshipResolvers<ContextType>;
  FriendshipStatus?: FriendshipStatusResolvers<ContextType>;
  LocationDetails?: LocationDetailsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  NotificationStatus?: NotificationStatusResolvers<ContextType>;
  Outing?: OutingResolvers<ContextType>;
  OutingProfileStates?: OutingProfileStatesResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

