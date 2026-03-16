import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { updateOnSheet } from '../../../../helpers/pusherServer';
import { VampireType } from '../../../../types/VampireType';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  const {
    query: { id },
    body,
  } = req;

  try {
    const vampire: {
      data: Array<{ data: VampireType; ref: any }>;
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

    if (!(vampire.data[0].data.editors || []).includes(session.user.id)) {
      return res.status(403).json({ error: 'unauthorized' });
    }
    // ok
    const vId = vampire.data[0].ref;
    const data = { ...JSON.parse(body) };
    const { appId } = data;
    delete data.appId;

    await client.query(q.Update(vId, { data }));

    // ok
    updateOnSheet(String(id), String(appId));
    res.status(200).json({ result: 'ok' });
  } catch (e) {
    // something went wrong
    res.status(500).json({ error: e.message });
  }
};

export default handler;
