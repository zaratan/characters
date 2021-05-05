import { handleAuth } from '@auth0/nextjs-auth0';

// eslint-disable-next-line dot-notation
process.env['AUTH0_BASE_URL'] =
  process.env.AUTH0_BASE_URL ||
  `https://${process.env.VERCEL_URL}` ||
  'http://localhost:3000';

console.log({ env: process.env });

export default handleAuth();
