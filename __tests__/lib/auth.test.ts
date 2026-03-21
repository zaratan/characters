import { describe, it, expect, vi } from 'vitest';

const { MockResend } = vi.hoisted(() => {
  const MockResend = vi.fn(function () {
    return { emails: { send: vi.fn() } };
  });
  return { MockResend };
});

vi.mock('resend', () => ({ Resend: MockResend }));

vi.mock('../../lib/auth-adapter', () => ({
  customPgAdapter: vi.fn(() => ({})),
}));

describe('authOptions', () => {
  it('does not throw when RESEND_API_KEY is undefined', async () => {
    delete process.env.RESEND_API_KEY;
    const { authOptions } = await import('../../lib/auth');
    expect(authOptions).toBeDefined();
    expect(MockResend).not.toHaveBeenCalled();
  });
});
