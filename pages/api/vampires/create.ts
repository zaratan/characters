import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import auth0 from '../../../helpers/auth0';

import base from '../../../defaultData/base';
import darkAge from '../../../defaultData/darkAge';
import victorian from '../../../defaultData/victorian';
import vampire from '../../../defaultData/vampire';
import human from '../../../defaultData/human';
import ghoul from '../../../defaultData/ghoul';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

const TYPE = {
  0: vampire,
  1: human,
  2: ghoul,
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await auth0().getSession(req);
  if (!session) {
    return res
      .status(403)
      .json({ error: 'Vous devez vous connecter pour effectuer cette action' });
  }
  try {
    const { type = 0, name = '', era = 0, id = 'aaaaaaaa' } = {
      ...JSON.parse(req.body),
    };

    const data = {
      ...base,
      ...(era === 0 ? darkAge : victorian),
      id,
      ...TYPE[type],
    };
    data.infos.name = name;
    data.infos.era = era;

    await client.query(q.Create(q.Collection('vampires'), { data }));

    // ok
    res.status(200).json({ result: 'ok' });
  } catch (e) {
    // something went wrong
    res.status(500).json({ error: e.message });
  }
};
