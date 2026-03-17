import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { db } from '../../../lib/db';
import { fetchOneVampire } from '../../../lib/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { id },
  } = req;

  const result = await fetchOneVampire(String(id));

  if (result.failed || !result.data) {
    return res.status(404).json({ error: 'not found', failed: true });
  }

  const vampire = result.data;

  if (vampire.privateSheet) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: 'unauthorized' });

    const canAccess = await db.vampires.isEditorOrViewer(
      String(id),
      session.user.id,
      session.user.isAdmin
    );
    if (!canAccess) return res.status(403).json({ error: 'unauthorized' });
  }

  // ok
  res.status(200).json(vampire);
};

export default handler;
