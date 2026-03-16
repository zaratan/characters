import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

// TODO: Phase 2 — rewrite with PostgreSQL queries
// FaunaDB is dead, returning empty list until PostgreSQL migration is complete
export const fetchVampireFromDB = async (_userId?: string) => {
  return { characters: [], failed: false };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  const result = await fetchVampireFromDB(session?.user?.id);

  if (!result.failed) {
    // ok
    res.status(200).json(result);
  } else {
    // something went wrong
    res.status(500).json(result);
  }
};

export default handler;
