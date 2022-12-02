export type UserInfo = {
  name: string;
  email: string;
};

export type User = {
  token: string;
  info: UserInfo;
};
