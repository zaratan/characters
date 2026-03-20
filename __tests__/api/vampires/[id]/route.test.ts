import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, mockSession } from '../../api-test-utils';

// ---------------------------------------------------------------------------
// Module mocks — must be declared before any imports of the route
// ---------------------------------------------------------------------------

vi.mock('../../../../lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('../../../../lib/queries', () => ({
  fetchOneVampire: vi.fn(),
}));

vi.mock('../../../../lib/db', () => ({
  db: {
    vampires: {
      isEditor: vi.fn(),
      isEditorOrViewer: vi.fn(),
      update: vi.fn(),
      updatePartial: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../../../../helpers/pusherServer', () => ({
  updateOnSheet: vi.fn(),
  updateOnSheets: vi.fn(),
}));

import {
  GET,
  PUT,
  PATCH,
  DELETE,
} from '../../../../app/api/vampires/[id]/route';
import { getSession } from '../../../../lib/auth';
import { fetchOneVampire } from '../../../../lib/queries';
import { db } from '../../../../lib/db';
import {
  updateOnSheet,
  updateOnSheets,
} from '../../../../helpers/pusherServer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VAMPIRE_ID = 'vamp-123';
const routeContext = { params: { id: VAMPIRE_ID } };

const publicVampire = {
  id: VAMPIRE_ID,
  privateSheet: false,
  editors: ['user-1'],
  viewers: [],
  infos: { name: 'Dracula' },
};

const privateVampire = {
  ...publicVampire,
  privateSheet: true,
};

function mockGetSession(session: ReturnType<typeof mockSession> | null) {
  vi.mocked(getSession).mockResolvedValue(session as any);
}

function mockFetchOneVampire(result: { data: unknown; failed: boolean }) {
  vi.mocked(fetchOneVampire).mockResolvedValue(result as any);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------

describe('GET /api/vampires/[id]', () => {
  it('returns 200 with vampire data for a public sheet', async () => {
    mockFetchOneVampire({ data: publicVampire, failed: false });

    const response = await GET(
      createRequest(`/api/vampires/${VAMPIRE_ID}`),
      routeContext
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(publicVampire);
  });

  it('returns 404 when fetchOneVampire returns failed:true', async () => {
    mockFetchOneVampire({ data: null, failed: true });

    const response = await GET(
      createRequest(`/api/vampires/${VAMPIRE_ID}`),
      routeContext
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.failed).toBe(true);
  });

  it('returns 401 for a private sheet when there is no session', async () => {
    mockFetchOneVampire({ data: privateVampire, failed: false });
    mockGetSession(null);

    const response = await GET(
      createRequest(`/api/vampires/${VAMPIRE_ID}`),
      routeContext
    );

    expect(response.status).toBe(401);
  });

  it('returns 403 for a private sheet when the user is not an editor or viewer', async () => {
    mockFetchOneVampire({ data: privateVampire, failed: false });
    mockGetSession(mockSession({ id: 'other-user' }));
    vi.mocked(db.vampires.isEditorOrViewer).mockResolvedValue(false);

    const response = await GET(
      createRequest(`/api/vampires/${VAMPIRE_ID}`),
      routeContext
    );

    expect(response.status).toBe(403);
  });

  it('returns 200 for a private sheet when the user is a viewer', async () => {
    mockFetchOneVampire({ data: privateVampire, failed: false });
    mockGetSession(mockSession({ id: 'viewer-user' }));
    vi.mocked(db.vampires.isEditorOrViewer).mockResolvedValue(true);

    const response = await GET(
      createRequest(`/api/vampires/${VAMPIRE_ID}`),
      routeContext
    );

    expect(response.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// PUT
// ---------------------------------------------------------------------------

describe('PUT /api/vampires/[id]', () => {
  it('returns 401 when there is no session', async () => {
    mockGetSession(null);

    const response = await PUT(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, {
        method: 'PUT',
        body: JSON.stringify({ infos: { name: 'Test' }, appId: 'app-1' }),
      }),
      routeContext
    );

    expect(response.status).toBe(401);
  });

  it('returns 403 when the user is not an editor', async () => {
    mockGetSession(mockSession({ id: 'other-user' }));
    vi.mocked(db.vampires.isEditor).mockResolvedValue(false);

    const response = await PUT(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, {
        method: 'PUT',
        body: JSON.stringify({ infos: { name: 'Test' }, appId: 'app-1' }),
      }),
      routeContext
    );

    expect(response.status).toBe(403);
  });

  it('calls db.vampires.update and updateOnSheet then returns 200 for a valid editor', async () => {
    const session = mockSession({ id: 'user-1' });
    mockGetSession(session);
    vi.mocked(db.vampires.isEditor).mockResolvedValue(true);
    vi.mocked(db.vampires.update).mockResolvedValue(undefined);

    const response = await PUT(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, {
        method: 'PUT',
        body: JSON.stringify({ infos: { name: 'Dracula' }, appId: 'app-42' }),
      }),
      routeContext
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ result: 'ok' });
    expect(db.vampires.update).toHaveBeenCalledWith(
      VAMPIRE_ID,
      expect.objectContaining({ infos: { name: 'Dracula' } })
    );
    // appId must be stripped from the payload passed to db.update
    expect(db.vampires.update).toHaveBeenCalledWith(
      VAMPIRE_ID,
      expect.not.objectContaining({ appId: expect.anything() })
    );
    expect(updateOnSheet).toHaveBeenCalledWith(VAMPIRE_ID, 'app-42');
    expect(updateOnSheets).not.toHaveBeenCalled();
  });

  it('returns 500 when the request body is not valid JSON', async () => {
    mockGetSession(mockSession({ id: 'user-1' }));
    vi.mocked(db.vampires.isEditor).mockResolvedValue(true);

    const response = await PUT(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, {
        method: 'PUT',
        body: 'not-json{{',
      }),
      routeContext
    );

    expect(response.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// PATCH
// ---------------------------------------------------------------------------

describe('PATCH /api/vampires/[id]', () => {
  it('returns 401 when there is no session', async () => {
    mockGetSession(null);

    const response = await PATCH(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, {
        method: 'PATCH',
        body: JSON.stringify({ privateSheet: true, appId: 'app-1' }),
      }),
      routeContext
    );

    expect(response.status).toBe(401);
  });

  it('returns 403 when the user is not an editor', async () => {
    mockGetSession(mockSession({ id: 'other-user' }));
    vi.mocked(db.vampires.isEditor).mockResolvedValue(false);

    const response = await PATCH(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, {
        method: 'PATCH',
        body: JSON.stringify({ privateSheet: true, appId: 'app-1' }),
      }),
      routeContext
    );

    expect(response.status).toBe(403);
  });

  it('calls db.vampires.updatePartial and updateOnSheet then returns 200 for a valid editor', async () => {
    mockGetSession(mockSession({ id: 'user-1' }));
    vi.mocked(db.vampires.isEditor).mockResolvedValue(true);
    vi.mocked(db.vampires.updatePartial).mockResolvedValue(undefined);

    const response = await PATCH(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, {
        method: 'PATCH',
        body: JSON.stringify({ privateSheet: true, appId: 'app-99' }),
      }),
      routeContext
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ result: 'ok' });
    expect(db.vampires.updatePartial).toHaveBeenCalledWith(
      VAMPIRE_ID,
      expect.objectContaining({ privateSheet: true })
    );
    expect(db.vampires.updatePartial).toHaveBeenCalledWith(
      VAMPIRE_ID,
      expect.not.objectContaining({ appId: expect.anything() })
    );
    expect(updateOnSheet).toHaveBeenCalledWith(VAMPIRE_ID, 'app-99');
    expect(updateOnSheets).not.toHaveBeenCalled();
  });

  it('returns 500 when the request body is not valid JSON', async () => {
    mockGetSession(mockSession({ id: 'user-1' }));
    vi.mocked(db.vampires.isEditor).mockResolvedValue(true);

    const response = await PATCH(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, {
        method: 'PATCH',
        body: 'not-json{{',
      }),
      routeContext
    );

    expect(response.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

describe('DELETE /api/vampires/[id]', () => {
  it('returns 401 when there is no session', async () => {
    mockGetSession(null);

    const response = await DELETE(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, { method: 'DELETE' }),
      routeContext
    );

    expect(response.status).toBe(401);
  });

  it('returns 403 when the user is not an editor', async () => {
    mockGetSession(mockSession({ id: 'other-user' }));
    vi.mocked(db.vampires.isEditor).mockResolvedValue(false);

    const response = await DELETE(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, { method: 'DELETE' }),
      routeContext
    );

    expect(response.status).toBe(403);
  });

  it('calls db.vampires.delete and returns 200 for a valid editor', async () => {
    mockGetSession(mockSession({ id: 'user-1' }));
    vi.mocked(db.vampires.isEditor).mockResolvedValue(true);
    vi.mocked(db.vampires.delete).mockResolvedValue(undefined);

    const response = await DELETE(
      createRequest(`/api/vampires/${VAMPIRE_ID}`, { method: 'DELETE' }),
      routeContext
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ result: 'ok' });
    expect(db.vampires.delete).toHaveBeenCalledWith(VAMPIRE_ID);
    expect(updateOnSheet).not.toHaveBeenCalled();
    expect(updateOnSheets).not.toHaveBeenCalled();
  });
});
