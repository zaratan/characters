import { NextApiRequest, NextApiResponse } from 'next';
import auth0 from '../../helpers/auth0';

const logout = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await auth0().handleLogout(req, res);
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).end(error.message);
  }
};

export default logout;
