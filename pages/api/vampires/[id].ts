import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export const fetchOneVampire = async (id: string) => {
  try {
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
    return { data: dbs.data[0].data, failed: false };
  } catch (e) {
    // something went wrong
    return { error: e.message, failed: true };
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { id },
  } = req;
  const vampire = await fetchOneVampire(String(id));

  if (!vampire.failed) {
    res.status(200).json(vampire.data);
  } else {
    // something went wrong
    res.status(500).json(vampire);
  }
};

export default handler;
