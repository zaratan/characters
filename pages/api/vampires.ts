import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { getSession } from '@auth0/nextjs-auth0';
import { VampireType } from '../../types/VampireType';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export const fetchVampireFromDB = async (userId?: string) => {
  try {
    const dbs: { data: Array<{ data: VampireType }> } = await client.query(
      q.Map(
        // iterate each item in result
        q.Paginate(
          // make paginatable
          q.Match(
            // query index
            q.Index('all_vampires_full')
          )
        ),
        (ref) => q.Get(ref)
      )
    );
    // ok

    const returnedVampires = dbs.data.filter(
      (vampire) =>
        !vampire.data.privateSheet ||
        (userId &&
          (vampire.data.editors.includes(userId) ||
            vampire.data.viewers.includes(userId)))
    );

    return {
      characters: returnedVampires.map((e) => ({
        key: e.data.id,
        name: e.data.infos.name,
      })),
      failed: false,
    };
  } catch (e) {
    // something went wrong
    return { error: e.message, failed: true };
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = getSession(req, res);
  const result = await fetchVampireFromDB(session?.user?.sub);

  if (!result.failed) {
    // ok
    res.status(200).json(result);
  } else {
    // something went wrong
    res.status(500).json(result);
  }
};

export default handler;
