import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { db } from '../../../../lib/db';
import { fetchOneVampire } from '../../../../lib/queries';
import { updateOnSheet } from '../../../../helpers/pusherServer';

type RouteContext = { params: { id: string } };

async function checkEditor(id: string, session) {
  const canEdit = await db.vampires.isEditor(
    id,
    session.user.id,
    session.user.isAdmin
  );
  return canEdit;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = params;
  const result = await fetchOneVampire(id);

  if (result.failed || !result.data) {
    return NextResponse.json(
      { error: 'not found', failed: true },
      { status: 404 }
    );
  }

  const vampire = result.data;

  if (vampire.privateSheet) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const canAccess = await db.vampires.isEditorOrViewer(
      id,
      session.user.id,
      session.user.isAdmin
    );
    if (!canAccess) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }
  }

  return NextResponse.json(vampire);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    if (!(await checkEditor(id, session))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { appId } = data;
    delete data.appId;

    await db.vampires.update(id, data);

    updateOnSheet(id, String(appId));
    return NextResponse.json({ result: 'ok' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    if (!(await checkEditor(id, session))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { appId } = data;
    delete data.appId;

    await db.vampires.updatePartial(id, data);

    updateOnSheet(id, String(appId));
    return NextResponse.json({ result: 'ok' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    if (!(await checkEditor(id, session))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    await db.vampires.delete(id);

    return NextResponse.json({ result: 'ok' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
