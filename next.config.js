console.log({ env: process.env });

module.exports = {
  env: {
    AUTH0_BASE_URL:
      process.env.AUTH0_BASE_URL ||
      process.env.VERCEL_URL ||
      'http://localhost:3000',
  },
};
