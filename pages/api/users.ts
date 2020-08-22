import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export const fetchUsersFromDB = async () => {
  try {
    const dbs: { data: Array<Array<string>> } = await client.query(
      // iterate each item in result
      q.Paginate(
        // make paginatable
        q.Match(
          // query index
          q.Index('all_users')
        )
      )
    );
    // ok

    return {
      users: dbs.data.map((e) => ({ key: e[0], name: e[1] })),
      failed: false,
    };
  } catch (e) {
    // something went wrong
    return { error: e.message, failed: true };
  }
};

const users = async (req: NextApiRequest, res: NextApiResponse) => {
  const result = await fetchUsersFromDB();

  if (!result.failed) {
    // ok
    res.status(200).json(result);
  } else {
    // something went wrong
    res.status(500).json(result);
  }
};

export default users;
