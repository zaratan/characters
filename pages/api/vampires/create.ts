import { NextApiRequest, NextApiResponse } from 'next';
import faunadb from 'faunadb';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';

import base from '../../../defaultData/base';
import darkAge from '../../../defaultData/darkAge';
import victorian from '../../../defaultData/victorian';
import vampire from '../../../defaultData/vampire';
import human from '../../../defaultData/human';
import ghoul from '../../../defaultData/ghoul';
import { updateOnSheets } from '../../../helpers/pusherServer';

// your secret hash
const secret = process.env.FAUNADB_SECRET_KEY;
const q = faunadb.query;
const client = new faunadb.Client({ secret });

const TYPE = {
  0: vampire,
  1: human,
  2: ghoul,
};

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const session = getSession(req, res);

    try {
      const { type = 0, name = '', era = 0, id = 'aaaaaaaa', appId = '' } = {
        ...JSON.parse(req.body),
      };

      const data = {
        ...base,
        ...(era === 0 ? darkAge : victorian),
        id,
        ...TYPE[type],
        editors: [session.user.sub],
        viewers: ['github|3338913'],
      };
      data.infos.name = name;
      data.infos.era = era;

      await client.query(q.Create(q.Collection('vampires'), { data }));

      // ok
      updateOnSheets(appId);
      res.status(200).json({ result: 'ok' });
    } catch (e) {
      // something went wrong
      res.status(500).json({ error: e.message });
    }
  }
);
