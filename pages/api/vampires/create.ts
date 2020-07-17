import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { updateOnSheets } from '../../../helpers/pusherServer';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export default async (req: NextApiRequest, res: NextApiResponse) => {
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
