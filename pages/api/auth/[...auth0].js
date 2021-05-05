import { handleAuth } from '@auth0/nextjs-auth0';

console.log({ env: process.env });

export default handleAuth();
