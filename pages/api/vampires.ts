import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { db } from '../../lib/db';

export const fetchVampireFromDB = async (
  userId?: string,
  isAdmin?: boolean
) => {
  try {
    const characters = await db.vampires.list(userId, isAdmin);
    return { characters, failed: false };
  } catch (e) {
    // something went wrong
    return { characters: [], failed: true };
  }
};

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
