import { createCookieSessionStorage } from '@remix-run/node';
import getConfig from '~/utils/config.server';

const config = getConfig();

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'bar_crawl_planner', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [config.AUTH0.COOKIE_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
