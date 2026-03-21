import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoist mock variables so vi.mock factory can reference them safely.
// Use regular functions (not arrow functions) for constructors used with `new`.
// ---------------------------------------------------------------------------

const { mockBind, mockSubscribe, MockPusherClient } = vi.hoisted(() => {
  const mockBind = vi.fn().mockReturnValue('bind-result');
  const mockSubscribe = vi.fn().mockReturnValue({ bind: mockBind });
  const MockPusherClient = vi.fn(function () {
    return { subscribe: mockSubscribe };
  });
  return { mockBind, mockSubscribe, MockPusherClient };
});

vi.mock('pusher-js/with-encryption', () => ({
  default: MockPusherClient,
}));

// Import after mock registration
import {
  pusherClient,
  subscribeToSheets,
  subscribeToSheet,
} from '../../helpers/pusherClient';
import {
  sheetsChannel,
  sheetChannel,
  UPDATE_EVENT,
} from '../../helpers/pusherConst';

beforeEach(() => {
  vi.clearAllMocks();
  mockBind.mockReturnValue('bind-result');
  mockSubscribe.mockReturnValue({ bind: mockBind });
  MockPusherClient.mockImplementation(function () {
    return { subscribe: mockSubscribe };
  });
  process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER = 'eu';
});

// ---------------------------------------------------------------------------
// pusherClient
// ---------------------------------------------------------------------------

describe('pusherClient', () => {
  it('creates a PusherClient with the env var key and cluster', () => {
    pusherClient();
    expect(MockPusherClient).toHaveBeenCalledWith('test-key', {
      cluster: 'eu',
    });
  });
});

// ---------------------------------------------------------------------------
// subscribeToSheets
// ---------------------------------------------------------------------------

describe('subscribeToSheets', () => {
  it('subscribes to the sheetsChannel', () => {
    const callback = vi.fn();
    subscribeToSheets({ callback });
    expect(mockSubscribe).toHaveBeenCalledWith(sheetsChannel);
  });

  it('binds the UPDATE_EVENT to the callback', () => {
    const callback = vi.fn();
    subscribeToSheets({ callback });
    expect(mockBind).toHaveBeenCalledWith(UPDATE_EVENT, callback);
  });

  it('accepts a pre-created client and does not create a new one', () => {
    const preCreatedClient = { subscribe: mockSubscribe } as any;
    const callback = vi.fn();
    subscribeToSheets({ callback, client: preCreatedClient });
    expect(MockPusherClient).not.toHaveBeenCalled();
    expect(mockSubscribe).toHaveBeenCalledWith(sheetsChannel);
  });

  it('returns client, channel, and bind', () => {
    const callback = vi.fn();
    const result = subscribeToSheets({ callback });
    expect(result).toHaveProperty('client');
    expect(result).toHaveProperty('channel');
    expect(result).toHaveProperty('bind');
  });
});

// ---------------------------------------------------------------------------
// subscribeToSheet
// ---------------------------------------------------------------------------

describe('subscribeToSheet', () => {
  it('subscribes to the channel for the given sheet id', () => {
    const callback = vi.fn();
    subscribeToSheet({ id: 'abc-123', callback });
    expect(mockSubscribe).toHaveBeenCalledWith(sheetChannel('abc-123'));
  });

  it('subscribes to vampire-sheet-{id} channel', () => {
    const callback = vi.fn();
    subscribeToSheet({ id: 'xyz-456', callback });
    expect(mockSubscribe).toHaveBeenCalledWith('vampire-sheet-xyz-456');
  });

  it('accepts a pre-created client and does not create a new one', () => {
    const preCreatedClient = { subscribe: mockSubscribe } as any;
    const callback = vi.fn();
    subscribeToSheet({ id: 'abc-123', callback, client: preCreatedClient });
    expect(MockPusherClient).not.toHaveBeenCalled();
  });
});
