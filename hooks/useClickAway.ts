import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

const useClickAway = (
  ref: RefObject<HTMLElement | null>,
  callback: (event: Event) => void
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (event: Event) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      callbackRef.current(event);
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref]);
};

export default useClickAway;
