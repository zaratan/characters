import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequest, mockSession } from '../../api-test-utils';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('../../../../lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('../../../../lib/db', () => ({
  db: {
    vampires: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../../../../helpers/pusherServer', () => ({
  updateOnSheets: vi.fn(),
  updateOnSheet: vi.fn(),
}));

import { POST } from '../../../../app/api/vampires/create/route';
import { getSession } from '../../../../lib/auth';
import { db } from '../../../../lib/db';
import { updateOnSheets } from '../../../../helpers/pusherServer';

// No template imports needed — assertions are made against the created data
// shape rather than raw template objects (avoids unused-import lint warnings).

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockGetSession(session: ReturnType<typeof mockSession> | null) {
  vi.mocked(getSession).mockResolvedValue(session as any);
}

function postBody(overrides?: Record<string, unknown>): string {
  return JSON.stringify({
    name: 'Test Vampire',
    type: 0,
    era: 0,
    appId: 'app-1',
    privateSheet: false,
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(db.vampires.create).mockResolvedValue('new-vamp-id');
});

describe('POST /api/vampires/create', () => {
  it('returns 401 when there is no session', async () => {
    mockGetSession(null);

    const response = await POST(
      createRequest('/api/vampires/create', {
        method: 'POST',
        body: postBody(),
      })
    );

    expect(response.status).toBe(401);
    expect(db.vampires.create).not.toHaveBeenCalled();
  });

  it('creates a darkAge + vampire character when type=0 and era=0 (defaults)', async () => {
    const session = mockSession({ id: 'user-1' });
    mockGetSession(session);

    await POST(
      createRequest('/api/vampires/create', {
        method: 'POST',
        body: postBody({ type: 0, era: 0, name: 'Dracula' }),
      })
    );

    expect(db.vampires.create).toHaveBeenCalledTimes(1);

    const [createdData, creatorId] = vi.mocked(db.vampires.create).mock
      .calls[0];

    // creator must be set correctly
    expect(creatorId).toBe('user-1');

    // editors and viewers from the route
    expect(createdData.editors).toEqual(['user-1']);
    expect(createdData.viewers).toEqual([]);

    // name must be set on infos
    expect(createdData.infos.name).toBe('Dracula');

    // era flag stored in infos
    expect(createdData.infos.era).toBe(0);

    // darkAge provides skills list; check one unique title
    const skillTitles = createdData.skills.map((s) => s.title);
    expect(skillTitles).toContain('Archerie'); // darkAge-specific skill

    // vampire template sections: blood and disciplines visible
    expect(createdData.sections.blood).toBe(true);
    expect(createdData.sections.disciplines).toBe(true);
  });

  it('creates a victorian + human character when type=1 and era=1', async () => {
    mockGetSession(mockSession({ id: 'user-2' }));

    await POST(
      createRequest('/api/vampires/create', {
        method: 'POST',
        body: postBody({ type: 1, era: 1, name: 'Van Helsing' }),
      })
    );

    expect(db.vampires.create).toHaveBeenCalledTimes(1);

    const [createdData] = vi.mocked(db.vampires.create).mock.calls[0];

    expect(createdData.infos.name).toBe('Van Helsing');
    expect(createdData.infos.era).toBe(1);

    // victorian provides different skills; check a unique title
    const skillTitles = createdData.skills.map((s) => s.title);
    expect(skillTitles).toContain('Tir'); // victorian-specific (vs Archerie in darkAge)

    // human template: blood and disciplines hidden
    expect(createdData.sections.blood).toBe(false);
    expect(createdData.sections.disciplines).toBe(false);
  });

  it('creates a ghoul character when type=2', async () => {
    mockGetSession(mockSession({ id: 'user-3' }));

    await POST(
      createRequest('/api/vampires/create', {
        method: 'POST',
        body: postBody({ type: 2, era: 0, name: 'Igor' }),
      })
    );

    expect(db.vampires.create).toHaveBeenCalledTimes(1);

    const [createdData] = vi.mocked(db.vampires.create).mock.calls[0];

    expect(createdData.infos.name).toBe('Igor');

    // ghoul template: blood visible, path hidden
    expect(createdData.sections.blood).toBe(true);
    expect(createdData.sections.path).toBe(false);
  });

  it('sets editors=[user.id] and viewers=[] regardless of body content', async () => {
    mockGetSession(mockSession({ id: 'user-owner' }));

    await POST(
      createRequest('/api/vampires/create', {
        method: 'POST',
        body: postBody(),
      })
    );

    const [createdData] = vi.mocked(db.vampires.create).mock.calls[0];
    expect(createdData.editors).toEqual(['user-owner']);
    expect(createdData.viewers).toEqual([]);
  });

  it('returns the new id returned by db.vampires.create', async () => {
    mockGetSession(mockSession({ id: 'user-1' }));
    vi.mocked(db.vampires.create).mockResolvedValue('created-42');

    const response = await POST(
      createRequest('/api/vampires/create', {
        method: 'POST',
        body: postBody(),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 'created-42' });
  });

  it('calls updateOnSheets with the appId from the request body', async () => {
    mockGetSession(mockSession({ id: 'user-1' }));

    await POST(
      createRequest('/api/vampires/create', {
        method: 'POST',
        body: postBody({ appId: 'pusher-app-7' }),
      })
    );

    expect(updateOnSheets).toHaveBeenCalledWith('pusher-app-7');
  });

  it('uses base defaults when type=99 (unknown type — spread of undefined is a no-op)', async () => {
    mockGetSession(mockSession({ id: 'user-1' }));

    // type=99 is not in the TYPE map; TYPE[99] is undefined.
    // Spreading undefined is a no-op in JavaScript, so the character
    // is created using only base + era template without type overrides.
    const response = await POST(
      createRequest('/api/vampires/create', {
        method: 'POST',
        body: postBody({ type: 99, era: 0 }),
      })
    );

    // The route itself does not validate type, so it succeeds
    expect(response.status).toBe(200);
    expect(db.vampires.create).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when db.vampires.create throws', async () => {
    mockGetSession(mockSession({ id: 'user-1' }));
    vi.mocked(db.vampires.create).mockRejectedValue(
      new Error('DB connection lost')
    );

    const response = await POST(
      createRequest('/api/vampires/create', {
        method: 'POST',
        body: postBody(),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('DB connection lost');
  });
});
