/* eslint-disable no-nested-ternary */
import { initAuth0 } from '@auth0/nextjs-auth0';
import { ServerResponse } from 'http';
import { NextApiRequest } from 'next';

const auth0 = () =>
  initAuth0({
    domain: process.env.AUTH0_DOMAIN || '',
    clientId: process.env.AUTH0_CLIENT_ID || '',
    clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    scope: 'openid profile email',
    redirectUri: process.env.BASE_URL
      ? `${process.env.BASE_URL}api/callback`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/callback`
      : 'http://localhost:3000/api/callback',
    postLogoutRedirectUri:
      process.env.BASE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000/',

    session: {
      // The secret used to encrypt the cookie.
      cookieSecret:
        process.env.AUTH0_COOKIE ||
        'ljbhbyt√˚¨∆¨©ftyyjghuytfyjhdsgyuktFYUKgBhyfgUIKIGFTYDfyg65e45E$%^ER&^Fcfghcvghjkbdsjknbs',
      // The cookie lifetime (expiration) in seconds. Set to 8 hours by default.
      cookieLifetime: 60 * 60 * 8,
    },
    oidcClient: {},
  });

export const forceLogin = async ({
  res,
  req,
}: {
  res: ServerResponse | undefined;
  req: NextApiRequest | undefined;
}) => {
  if (typeof window !== 'undefined' || !res || !req) return {};

  const session = await auth0().getSession(req);

  if (!session) {
    res.writeHead(302, {
      Location: '/api/login',
    });
    res.end();
    return {};
  }
  const { user } = session;
  return { userSession: user };
};

export default auth0;
