import type { AppLoadContext } from '@remix-run/node';
import type { Auth0ExtraParams, Auth0Profile } from 'remix-auth-auth0';

export type Auth0User = {
  accessToken: string;
  extraParams: Auth0ExtraParams;
  refreshToken?: string;
  context?: AppLoadContext;
  profile: Auth0Profile;
};
