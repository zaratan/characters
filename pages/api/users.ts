import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { pick } from 'lodash';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export const fetchUsersFromDB = async () => {
  try {
    const dbs: {
      data: Array<{
        data: {
          nickname: string;
          name: string;
          picture: string;
          email: string;
          sub: string;
        };
      }>;
    } = await client.query(
      q.Map(
        // iterate each item in result
        q.Paginate(
          // make paginatable
          q.Match(
            // query index
            q.Index('all_users')
          )
        ),
        (ref) => q.Get(ref)
      )
    );
    // ok

    return {
      users: dbs.data.map((e) =>
        pick(e.data, ['nickname', 'picture', 'name', 'email', 'sub'])
      ),
      failed: false,
    };
  } catch (e) {
    // something went wrong
    return { error: e.message, failed: true };
  }
};

const users = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const result = await fetchUsersFromDB();

    if (!result.failed) {
      // ok
      res.status(200).json(result);
    } else {
      // something went wrong
      res.status(500).json(result);
    }
  }
);

export default users;
