import { useState, useEffect } from 'react';

const useKeyboardShortcut = (
  combination: string,
  action = (_keyboardEvent?: KeyboardEvent) => {}
) => {
  const [keyboardJS, setKeyboardJS] = useState<
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    typeof import('keyboardjs') | null
  >(null);

  useEffect(() => {
    import('keyboardjs').then((k) => setKeyboardJS(k.default || k));
    if (!keyboardJS) return;
    keyboardJS.bind(combination, action);
    return () => {
      keyboardJS.unbind(combination, action);
    };
  }, [action, combination, keyboardJS]);
};

export default useKeyboardShortcut;
