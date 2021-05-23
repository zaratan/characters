import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

const URL_WHITELIST = [/^\/vampires\/[^/]*(\/config)?$/, /^\/$/, /^\/new$/];

export default handleAuth({
  async login(req, res) {
    try {
      let returnTo = String(req.query.return) || '/';
      if (!URL_WHITELIST.find((regex) => regex.test(returnTo))) {
        returnTo = '/';
      }

      await handleLogin(req, res, {
        returnTo,
      });
    } catch (error) {
      res.status(error.status || 400).end(error.message);
    }
  },
});
