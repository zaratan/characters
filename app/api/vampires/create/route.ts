import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { db } from '../../../../lib/db';
import base from '../../../../defaultData/base';
import darkAge from '../../../../defaultData/darkAge';
import victorian from '../../../../defaultData/victorian';
import vampire from '../../../../defaultData/vampire';
import human from '../../../../defaultData/human';
import ghoul from '../../../../defaultData/ghoul';
import { updateOnSheets } from '../../../../helpers/pusherServer';

const TYPE = {
  0: vampire,
  1: human,
  2: ghoul,
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const {
      type = 0,
      name = '',
      era = 0,
      appId = '',
      privateSheet = false,
    } = await request.json();

    const data = {
      ...base,
      ...(era === 0 ? darkAge : victorian),
      ...TYPE[type],
      editors: [session.user.id],
      viewers: [],
      privateSheet,
    };
    data.infos.name = name;
    data.infos.era = era;

    const id = await db.vampires.create(data, session.user.id);

    updateOnSheets(appId);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
