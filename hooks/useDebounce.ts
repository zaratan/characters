import { useEffect, useRef } from 'react';

const useDebounce = (
  callback: () => void,
  delay: number,
  deps: ReadonlyArray<unknown>
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      callbackRef.current();
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useDebounce;
