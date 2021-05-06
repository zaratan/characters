import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { updateOnSheet } from '../../../../helpers/pusherServer';
// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
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

      await client.query(
        q.Replace(vId, {
          data,
        })
      );

      // ok
      updateOnSheet(String(id), String(appId));
      res.status(200).json({ result: 'ok' });
    } catch (e) {
      // something went wrong
      res.status(500).json({ error: e.message });
    }
  }
);
