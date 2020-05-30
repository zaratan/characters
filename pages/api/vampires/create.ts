import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { updateOnSheets } from '../../../helpers/pusherServer';
import auth0 from '../../../helpers/auth0';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await auth0().getSession(req);
  if (!session) {
    return res
      .status(403)
      .json({ error: 'Vous devez vous connecter pour effectuer cette action' });
  }
  try {
    const data = { ...JSON.parse(req.body) };
    const { appId } = data;
    delete data.appId;

    await client.query(q.Create(q.Collection('vampires'), { data }));

    // ok
    updateOnSheets(String(appId));
    res.status(200).json({ result: 'ok' });
  } catch (e) {
    // something went wrong
    res.status(500).json({ error: e.message });
  }
};
