import type { Session } from '@remix-run/node';

export type UserInfo = {
  name: string;
  email: string;
};

// TODO figure out how to properly type authData
export type User = {
  authData: any;
  info: UserInfo;
};

export type ValidationResponse = {
  valid: boolean;
  user: User | null;
  session: Session | null;
};
