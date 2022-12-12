import type { Session } from '@remix-run/node';

export type UserInfo = {
  name: string;
  email: string;
};

export type User = {
  token: string;
  info: UserInfo;
};

export type ValidationResponse = {
  valid: boolean;
  user: User | null;
  session: Session | null;
};
