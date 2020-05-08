import { NextApiRequest, NextApiResponse } from 'next';
import auth0 from '../../helpers/auth0';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await auth0().handleLogin(req, res);
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).end(error.message);
  }
};
