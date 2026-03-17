import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth';
import { fetchVampireFromDB } from '../../../lib/queries';

export async function GET() {
  const session = await getSession();
  const result = await fetchVampireFromDB(
    session?.user?.id,
    session?.user?.isAdmin
  );

  if (!result.failed) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
