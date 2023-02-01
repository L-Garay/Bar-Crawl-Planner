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
  photos?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  addFriend?: Maybe<Profile>;
  createAccount?: Maybe<Account>;
  createProfile?: Maybe<Profile>;
  deactivateUserAccount?: Maybe<Account>;
  removeFriend?: Maybe<Profile>;
  updateUserAccount?: Maybe<Account>;
};


export type MutationAddFriendArgs = {
  friend_id: Scalars['Int'];
  id: Scalars['Int'];
};


export type MutationCreateAccountArgs = {
  email?: InputMaybe<Scalars['String']>;
  email_verified?: InputMaybe<Scalars['Boolean']>;
};


export type MutationCreateProfileArgs = {
  account_id?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  profile_img?: InputMaybe<Scalars['String']>;
};


export type MutationDeactivateUserAccountArgs = {
  id: Scalars['Int'];
};


export type MutationRemoveFriendArgs = {
  friend_id: Scalars['Int'];
  id: Scalars['Int'];
};


export type MutationUpdateUserAccountArgs = {
  email?: InputMaybe<Scalars['String']>;
  phone_number?: InputMaybe<Scalars['String']>;
};

export type Outing = {
  __typename?: 'Outing';
  created_at?: Maybe<Scalars['String']>;
  creator_profile_id?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  profiles?: Maybe<Array<Maybe<Profile>>>;
  start_date_and_time?: Maybe<Scalars['String']>;
};

export type Profile = {
  __typename?: 'Profile';
  account?: Maybe<Account>;
  account_id?: Maybe<Scalars['Int']>;
  friends?: Maybe<Array<Maybe<Profile>>>;
  friendsRelation?: Maybe<Array<Maybe<Profile>>>;
  id?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  outings?: Maybe<Array<Maybe<Outing>>>;
  profile_img?: Maybe<Scalars['String']>;
  social_pin?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  accounts?: Maybe<Array<Maybe<Account>>>;
  findFriendById?: Maybe<Profile>;
  findFriendByPin?: Maybe<Profile>;
  getAccountByEmail?: Maybe<Account>;
  getAllFriends?: Maybe<Array<Maybe<Profile>>>;
  getUserAccount?: Maybe<Account>;
  outing?: Maybe<Outing>;
  outings?: Maybe<Array<Maybe<Outing>>>;
  profile?: Maybe<Profile>;
  profiles?: Maybe<Array<Maybe<Profile>>>;
};


export type QueryFindFriendByIdArgs = {
  id: Scalars['Int'];
};


export type QueryFindFriendByPinArgs = {
  social_pin: Scalars['String'];
};


export type QueryGetAccountByEmailArgs = {
  email: Scalars['String'];
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
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LocationDetails: ResolverTypeWrapper<LocationDetails>;
  Mutation: ResolverTypeWrapper<{}>;
  Outing: ResolverTypeWrapper<Outing>;
  Profile: ResolverTypeWrapper<Profile>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Account: Account;
  Boolean: Scalars['Boolean'];
  Float: Scalars['Float'];
  Int: Scalars['Int'];
  LocationDetails: LocationDetails;
  Mutation: {};
  Outing: Outing;
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
  photos?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
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
  addFriend?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType, RequireFields<MutationAddFriendArgs, 'friend_id' | 'id'>>;
  createAccount?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, Partial<MutationCreateAccountArgs>>;
  createProfile?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType, Partial<MutationCreateProfileArgs>>;
  deactivateUserAccount?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<MutationDeactivateUserAccountArgs, 'id'>>;
  removeFriend?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType, RequireFields<MutationRemoveFriendArgs, 'friend_id' | 'id'>>;
  updateUserAccount?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, Partial<MutationUpdateUserAccountArgs>>;
}>;

export type OutingResolvers<ContextType = any, ParentType extends ResolversParentTypes['Outing'] = ResolversParentTypes['Outing']> = ResolversObject<{
  created_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  creator_profile_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profiles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  start_date_and_time?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfileResolvers<ContextType = any, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = ResolversObject<{
  account?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType>;
  account_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  friends?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  friendsRelation?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  outings?: Resolver<Maybe<Array<Maybe<ResolversTypes['Outing']>>>, ParentType, ContextType>;
  profile_img?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  social_pin?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  accounts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Account']>>>, ParentType, ContextType>;
  findFriendById?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType, RequireFields<QueryFindFriendByIdArgs, 'id'>>;
  findFriendByPin?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType, RequireFields<QueryFindFriendByPinArgs, 'social_pin'>>;
  getAccountByEmail?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryGetAccountByEmailArgs, 'email'>>;
  getAllFriends?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
  getUserAccount?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType>;
  outing?: Resolver<Maybe<ResolversTypes['Outing']>, ParentType, ContextType>;
  outings?: Resolver<Maybe<Array<Maybe<ResolversTypes['Outing']>>>, ParentType, ContextType>;
  profile?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType>;
  profiles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Profile']>>>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Account?: AccountResolvers<ContextType>;
  LocationDetails?: LocationDetailsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Outing?: OutingResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

