// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScroll } from '../../hooks/useScroll';

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
  Object.defineProperty(window, 'pageYOffset', {
    writable: true,
    configurable: true,
    value: 0,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function fireScroll() {
  window.dispatchEvent(new Event('scroll'));
}

describe('useScroll', () => {
  it('returns initial state with currentScroll=0 and scrollingUp=false', () => {
    const { result } = renderHook(() => useScroll());

    expect(result.current.currentScroll).toBe(0);
    expect(result.current.scrollingUp).toBe(false);
  });

  it('updates currentScroll and keeps scrollingUp=false when scrolling down', () => {
    const { result } = renderHook(() => useScroll({ wait: 100 }));

    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 200,
      });
      fireScroll();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.currentScroll).toBe(200);
    expect(result.current.scrollingUp).toBe(false);
  });

  it('sets scrollingUp=true when scrolling up', () => {
    const { result } = renderHook(() => useScroll({ wait: 100 }));

    // Scroll down first to establish a non-zero prevScroll
    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 300,
      });
      fireScroll();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.scrollingUp).toBe(false);

    // Now scroll back up
    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 100,
      });
      fireScroll();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.scrollingUp).toBe(true);
    expect(result.current.currentScroll).toBe(100);
  });

  it('calls the onScroll callback with prevScroll and nextScroll', () => {
    const onScroll = vi.fn();
    renderHook(() => useScroll({ wait: 100, onScroll }));

    act(() => {
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        configurable: true,
        value: 150,
      });
      fireScroll();
      vi.advanceTimersByTime(200);
    });

    expect(onScroll).toHaveBeenCalledWith({ prevScroll: 0, nextScroll: 150 });
  });

  it('does not fire when scroll position is unchanged', () => {
    const onScroll = vi.fn();
    renderHook(() => useScroll({ wait: 100, onScroll }));

    act(() => {
      // pageYOffset stays at 0 (same as prevScroll)
      fireScroll();
      vi.advanceTimersByTime(200);
    });

    expect(onScroll).not.toHaveBeenCalled();
  });

  it('removes the scroll event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScroll());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  it('calls scrollWatcher.cancel() on unmount', () => {
    // Capture the throttled function registered as the scroll listener so we
    // can assert that its .cancel() method is called during cleanup.
    let capturedListener:
      | (EventListenerOrEventListenerObject & { cancel?: () => void })
      | undefined;

    const realAddEventListener = window.addEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type, listener, options) => {
        if (type === 'scroll') {
          capturedListener = listener as typeof capturedListener;
        }
        return realAddEventListener(type, listener, options);
      }
    );

    const { unmount } = renderHook(() => useScroll());

    // The lodash throttle function decorates the listener with .cancel()
    expect(capturedListener).toBeDefined();
    expect(typeof capturedListener!.cancel).toBe('function');

    const cancelSpy = vi.spyOn(
      capturedListener as { cancel: () => void },
      'cancel'
    );

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
