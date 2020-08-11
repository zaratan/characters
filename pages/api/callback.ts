import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import auth0 from '../../helpers/auth0';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

const callback = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await auth0().handleCallback(req, res, {
      redirectTo: '/',
      onUserLoaded: async (req2, res2, session, state) => {
        const dbUser: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: Array<{ data: any; ref: any }>;
        } = await client.query(
          q.Map(
            // iterate each item in result
            q.Paginate(
              // make paginatable
              q.Match(
                // query index
                q.Index('one_user'),
                session.user.sub // specify source
              )
            ),
            (ref) => q.Get(ref) // lookup each result by its reference
          )
        );
        // ok
        const data = session.user;
        if (dbUser.data.length > 0) {
          // user exist we update it
          const userId = dbUser.data[0].ref;
          await client.query(
            q.Replace(userId, {
              data,
            })
          );
        } else {
          // user doesn't exist we create it
          await client.query(q.Create(q.Collection('users'), { data }));
        }

        return session;
      },
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).end(error.message);
  }
};

export default callback;
