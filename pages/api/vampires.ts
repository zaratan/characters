import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { fetchVampireFromDB } from '../../lib/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  const result = await fetchVampireFromDB(
    session?.user?.id,
    session?.user?.isAdmin
  );

  if (!result.failed) {
    // ok
    res.status(200).json(result);
  } else {
    // something went wrong
    res.status(500).json(result);
  }
};

export default handler;
