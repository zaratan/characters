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
    const vampire: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: Array<{ data: any; ref: any }>;
    } = await client.query(
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
    const vId = vampire.data[0].ref;

    await client.query(
      q.Replace(vId, {
        data: { ...JSON.parse(req.body) },
      })
    );

    // ok
    res.status(200).json({ result: 'ok' });
  } catch (e) {
    // something went wrong
    res.status(500).json({ error: e.message });
  }
};
