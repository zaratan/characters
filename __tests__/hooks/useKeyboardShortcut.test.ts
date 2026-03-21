// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';

const mockBind = vi.fn();
const mockUnbind = vi.fn();

vi.mock('keyboardjs', () => ({
  default: {
    bind: mockBind,
    unbind: mockUnbind,
  },
}));

beforeEach(() => {
  mockBind.mockClear();
  mockUnbind.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useKeyboardShortcut', () => {
  it('calls bind with combination and action after async keyboardjs resolves', async () => {
    const action = vi.fn();
    renderHook(() => useKeyboardShortcut('ctrl+s', action));

    await waitFor(() => expect(mockBind).toHaveBeenCalled());

    expect(mockBind).toHaveBeenCalledWith('ctrl+s', action);
  });

  it('calls unbind on unmount', async () => {
    const action = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcut('ctrl+s', action));

    await waitFor(() => expect(mockBind).toHaveBeenCalled());

    unmount();

    expect(mockUnbind).toHaveBeenCalledWith('ctrl+s', action);
  });

  it('rebinds when combination changes', async () => {
    const action = vi.fn();
    const { rerender } = renderHook(
      ({ combo }: { combo: string }) => useKeyboardShortcut(combo, action),
      { initialProps: { combo: 'ctrl+s' } }
    );

    await waitFor(() =>
      expect(mockBind).toHaveBeenCalledWith('ctrl+s', action)
    );

    rerender({ combo: 'ctrl+z' });

    await waitFor(() =>
      expect(mockBind).toHaveBeenCalledWith('ctrl+z', action)
    );
    expect(mockUnbind).toHaveBeenCalledWith('ctrl+s', action);
  });

  it('does not bind before keyboardjs has loaded', () => {
    // Immediately after renderHook (before the dynamic import resolves),
    // bind should not yet have been called synchronously.
    const action = vi.fn();
    renderHook(() => useKeyboardShortcut('ctrl+k', action));

    // bind is not called synchronously — only after the import promise settles
    expect(mockBind).not.toHaveBeenCalled();
  });
});
