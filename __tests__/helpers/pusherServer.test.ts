import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoist mock variables so vi.mock factory can reference them safely.
// Use regular functions (not arrow functions) for constructors used with `new`.
// ---------------------------------------------------------------------------

const { mockTrigger, MockPusher } = vi.hoisted(() => {
  const mockTrigger = vi.fn().mockResolvedValue({});
  const MockPusher = vi.fn(function () {
    return { trigger: mockTrigger };
  });
  return { mockTrigger, MockPusher };
});

vi.mock('pusher', () => ({
  default: MockPusher,
}));

// Import after mock registration
import { updateOnSheets, updateOnSheet } from '../../helpers/pusherServer';
import {
  sheetsChannel,
  sheetChannel,
  UPDATE_EVENT,
} from '../../helpers/pusherConst';

beforeEach(() => {
  vi.clearAllMocks();
  mockTrigger.mockResolvedValue({});
  MockPusher.mockImplementation(function () {
    return { trigger: mockTrigger };
  });
  process.env.PUSHER_APP_ID = 'app-123';
  process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
  process.env.PUSHER_SECRET = 'test-secret';
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER = 'eu';
});

// ---------------------------------------------------------------------------
// updateOnSheets
// ---------------------------------------------------------------------------

describe('updateOnSheets', () => {
  it('triggers on the sheetsChannel with UPDATE_EVENT and appId payload', () => {
    updateOnSheets('my-app-id');
    expect(mockTrigger).toHaveBeenCalledWith(sheetsChannel, UPDATE_EVENT, {
      appId: 'my-app-id',
    });
  });

  it('creates a new Pusher server instance on each call', () => {
    updateOnSheets('app-1');
    updateOnSheets('app-2');
    expect(MockPusher).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// updateOnSheet
// ---------------------------------------------------------------------------

describe('updateOnSheet', () => {
  it('triggers on the sheetChannel for the given id', () => {
    updateOnSheet('sheet-42', 'my-app-id');
    expect(mockTrigger).toHaveBeenCalledWith(
      sheetChannel('sheet-42'),
      UPDATE_EVENT,
      { appId: 'my-app-id' }
    );
  });

  it('triggers on vampire-sheet-{id} channel', () => {
    updateOnSheet('xyz-789', 'app-id');
    expect(mockTrigger).toHaveBeenCalledWith(
      'vampire-sheet-xyz-789',
      UPDATE_EVENT,
      { appId: 'app-id' }
    );
  });
});
