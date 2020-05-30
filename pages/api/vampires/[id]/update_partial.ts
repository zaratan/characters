import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { updateOnSheet } from '../../../../helpers/pusherServer';
import auth0 from '../../../../helpers/auth0';

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
  const {
    query: { id },
    body,
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
