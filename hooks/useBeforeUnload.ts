import { useEffect } from 'react';

const useBeforeUnload = (when: boolean, message: string) => {
  useEffect(() => {
    if (!when) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when, message]);
};

export default useBeforeUnload;
