import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth';
import { fetchUsersFromDB } from '../../../lib/queries';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const result = await fetchUsersFromDB();

  if (!result.failed) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
