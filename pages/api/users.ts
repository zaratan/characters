import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { db } from '../../lib/db';

export const fetchUsersFromDB = async () => {
  try {
    const users = await db.users.findAllPublic();
    return { users, failed: false };
  } catch (e) {
    // something went wrong
    return { users: [], failed: true };
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  const result = await fetchUsersFromDB();

  if (!result.failed) {
    // ok
    res.status(200).json(result);
  } else {
    // something went wrong
    res.status(500).json(result);
  }
};

export default handler;
