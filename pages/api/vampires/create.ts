import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { updateOnSheets } from '../../../helpers/pusherServer';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await client.query(
      q.Create(q.Collection('vampires'), { data: { ...JSON.parse(req.body) } })
    );

    // ok
    updateOnSheets();
    res.status(200).json({ result: 'ok' });
  } catch (e) {
    // something went wrong
    res.status(500).json({ error: e.message });
  }
};
