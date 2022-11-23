import invariant from 'tiny-invariant';

const getConfig = (variables: any) => {
  invariant(variables.SERVER_ADDRESS, 'SERVER_ADDRESS is undefined');
  invariant(variables.AUTH0_CLIENT_ID, 'AUTH0_CLIENT_ID is undefined');
  invariant(
    variables.AUTH0_SESSION_SECRET,
    'AUTH0_SESSION_SECRET is undefined'
  );
  invariant(variables.AUTH0_CLIENT_SECRET, 'AUTH0_CLIENT_SECRET is undefined');
  invariant(variables.AUTH0_DOMAIN, 'AUTH0_DOMAIN is undefined');
  invariant(variables.AUTH0_LOGOUT_URL, 'AUTH0_LOGOUT_URL is undefined');
  invariant(variables.AUTH0_LOGIN_URL, 'AUTH0_LOGIN_URL is undefined');
  invariant(variables.COOKIE_SECRET, 'COOKIE_SECRET is undefined');
  invariant(variables.AUTH0_CALLBACK_URL, 'AUTH0_CALLBACK_URL is undefined');
  // invariant(
  //   variables.AUTH0_RETURN_TO_URL,
  //   "AUTH0_RETURN_TO_URL is undefined",
  // );

  const SERVER_ADDRESS = variables.SERVER_ADDRESS!;
  const AUTH0_CLIENT_ID = variables.AUTH0_CLIENT_ID!;
  const AUTH0_SESSION_SECRET = variables.AUTH0_SESSION_SECRET!;
  const AUTH0_CLIENT_SECRET = variables.AUTH0_CLIENT_SECRET!;
  const AUTH0_DOMAIN = variables.AUTH0_DOMAIN!;
  const AUTH0_LOGOUT_URL = variables.AUTH0_LOGOUT_URL!;
  const AUTH0_LOGIN_URL = variables.AUTH0_LOGIN_URL!;
  const COOKIE_SECRET = variables.COOKIE_SECRET!;
  const AUTH0_CALLBACK_URL = variables.AUTH0_CALLBACK_URL!;
  // const AUTH0_RETURN_TO_URL = variables.AUTH0_RETURN_TO_URL!;

  const config = {
    AUTH0: {
      CLIENT_ID: AUTH0_CLIENT_ID,
      CLIENT_SECRET: AUTH0_CLIENT_SECRET,
      SESSION_SECRET: AUTH0_SESSION_SECRET,
      DOMAIN: AUTH0_DOMAIN,
      //   RETURN_TO_URL: AUTH0_RETURN_TO_URL,
      LOGOUT_URL: AUTH0_LOGOUT_URL,
      LOGIN_URL: AUTH0_LOGIN_URL,
      CALLBACK_URL: AUTH0_CALLBACK_URL,
      COOKIE_SECRET: COOKIE_SECRET,
    },
    SERVER: {
      ADDRESS: SERVER_ADDRESS,
    },
  } as const;

  return config;
};

export default getConfig;
