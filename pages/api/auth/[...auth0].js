import { handleAuth } from '@auth0/nextjs-auth0';

console.log({ env: process.env, base_auth: process.env.AUTH0_BASE_URL });

export default handleAuth();
