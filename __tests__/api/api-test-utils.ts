import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Session factory (re-exported from shared test-utils)
// ---------------------------------------------------------------------------

/**
 * NOTE (Next.js 15 migration): when upgrading to Next.js 15, the `params`
 * argument passed to route handlers becomes a Promise<{ id: string }>.
 * At that point, all tests that pass `{ params: { id } }` must change to
 * `{ params: Promise.resolve({ id }) }` and route handlers must `await params`.
 */
export { mockSession, mockMe } from '../test-utils';

// ---------------------------------------------------------------------------
// Request factory
// ---------------------------------------------------------------------------

/**
 * Wraps `new NextRequest(url, options)` so tests don't have to import
 * NextRequest themselves, and provides a consistent default base URL.
 */
export const createRequest = (
  url: string,
  options?: RequestInit & { body?: string }
): NextRequest => {
  const fullUrl = url.startsWith('http') ? url : `http://localhost${url}`;

  return new NextRequest(fullUrl, options as any);
};
