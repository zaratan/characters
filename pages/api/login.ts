import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import auth0 from '../../helpers/auth0';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await auth0().handleLogin(req, res);
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).end(error.message);
  }
};
