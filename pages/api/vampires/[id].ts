import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { id },
  } = req;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbs: { data: Array<{ data: any }> } = await client.query(
      q.Map(
        // iterate each item in result
        q.Paginate(
          // make paginatable
          q.Match(
            // query index
            q.Index('one_vampire'),
            id // specify source
          )
        ),
        (ref) => q.Get(ref) // lookup each result by its reference
      )
    );
    // ok
    res.status(200).json(dbs.data[0].data);
  } catch (e) {
    // something went wrong
    res.status(500).json({ error: e.message });
  }
};
