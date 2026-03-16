import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { db } from '../../../../lib/db';
import { updateOnSheet } from '../../../../helpers/pusherServer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  const {
    query: { id },
    body,
  } = req;

  try {
    const canEdit = await db.vampires.isEditor(
      String(id),
      session.user.id,
      session.user.isAdmin
    );
    if (!canEdit) return res.status(403).json({ error: 'unauthorized' });

    const data = { ...JSON.parse(body) };
    const { appId } = data;
    delete data.appId;

    await db.vampires.update(String(id), data);

    // ok
    updateOnSheet(String(id), String(appId));
    res.status(200).json({ result: 'ok' });
  } catch (e) {
    // something went wrong
    res.status(500).json({ error: e.message });
  }
};

export default handler;
