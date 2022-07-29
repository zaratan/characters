import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { updateOnSheet } from '../../../../helpers/pusherServer';
import { VampireType } from '../../../../types/VampireType';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { user } = getSession(req, res);

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

      if (
        !(vampire.data[0].data.editors || ['github|3338913']).includes(user.sub)
      ) {
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
  }
);
