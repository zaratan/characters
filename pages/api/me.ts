import { NextApiRequest, NextApiResponse } from 'next';
import auth0 from '../../helpers/auth0';

const me = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    return await auth0().handleProfile(req, res, {});
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
};

export default me;
