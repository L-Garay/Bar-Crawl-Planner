import invariant from 'tiny-invariant';

const getConfig = () => {
  invariant(process.env.SERVER_ADDRESS, 'SERVER_ADDRESS is undefined');
  invariant(process.env.AUTH0_CLIENT_ID, 'AUTH0_CLIENT_ID is undefined');
  invariant(process.env.AUTH0_AUDIENCE, 'AUTH0_AUDIENCE is undefined');
  invariant(
    process.env.AUTH0_SESSION_SECRET,
    'AUTH0_SESSION_SECRET is undefined'
  );
  invariant(
    process.env.AUTH0_CLIENT_SECRET,
    'AUTH0_CLIENT_SECRET is undefined'
  );
  invariant(process.env.AUTH0_DOMAIN, 'AUTH0_DOMAIN is undefined');
  invariant(process.env.AUTH0_LOGOUT_URL, 'AUTH0_LOGOUT_URL is undefined');
  invariant(process.env.AUTH0_LOGIN_URL, 'AUTH0_LOGIN_URL is undefined');
  invariant(
    process.env.AUTH0_RETURN_TO_URL,
    'AUTH0_RETURN_TO_URL is undefined'
  );
  invariant(process.env.COOKIE_SECRET, 'COOKIE_SECRET is undefined');
  invariant(process.env.AUTH0_CALLBACK_URL, 'AUTH0_CALLBACK_URL is undefined');
  invariant(process.env.LOGIN_PAGE, 'LOGIN_PAGE is undefined');

  const SERVER_ADDRESS = process.env.SERVER_ADDRESS!;
  const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID!;
  const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;
  const AUTH0_SESSION_SECRET = process.env.AUTH0_SESSION_SECRET!;
  const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET!;
  const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
  const AUTH0_LOGOUT_URL = process.env.AUTH0_LOGOUT_URL!;
  const AUTH0_LOGIN_URL = process.env.AUTH0_LOGIN_URL!;
  const AUTH0_RETURN_TO_URL = process.env.AUTH0_RETURN_TO_URL!;
  const COOKIE_SECRET = process.env.COOKIE_SECRET!;
  const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL!;
  const LOGIN_PAGE = process.env.LOGIN_PAGE!;

  const config = {
    AUTH0: {
      CLIENT_ID: AUTH0_CLIENT_ID,
      AUDIENCE: AUTH0_AUDIENCE,
      CLIENT_SECRET: AUTH0_CLIENT_SECRET,
      SESSION_SECRET: AUTH0_SESSION_SECRET,
      DOMAIN: AUTH0_DOMAIN,
      RETURN_TO_URL: AUTH0_RETURN_TO_URL,
      LOGOUT_URL: AUTH0_LOGOUT_URL,
      LOGIN_URL: AUTH0_LOGIN_URL,
      LOGIN_PAGE,
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
