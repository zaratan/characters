import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { db } from '../../../../lib/db';

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const rawName = typeof body.name === 'string' ? body.name : '';
  const name = rawName.trim().replace(/\s+/g, ' ');

  if (name.length === 0) {
    return NextResponse.json(
      { error: 'Le nom ne peut pas être vide.' },
      { status: 400 }
    );
  }

  if (name.length > 100) {
    return NextResponse.json(
      { error: 'Le nom ne peut pas dépasser 100 caractères.' },
      { status: 400 }
    );
  }

  const taken = await db.users.isNameTaken(name, session.user.id);
  if (taken) {
    return NextResponse.json(
      { error: 'Ce nom est déjà pris.' },
      { status: 409 }
    );
  }

  try {
    await db.users.updateName(session.user.id, name);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (
      err !== null &&
      typeof err === 'object' &&
      (err as Record<string, unknown>).code === '23505'
    ) {
      return NextResponse.json(
        { error: 'Ce nom est déjà pris.' },
        { status: 409 }
      );
    }
    throw err;
  }
}
