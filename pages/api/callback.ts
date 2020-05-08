import { NextApiRequest, NextApiResponse } from 'next';
import auth0 from '../../helpers/auth0';

const callback = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await auth0().handleCallback(req, res, { redirectTo: '/' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).end(error.message);
  }
};

export default callback;
