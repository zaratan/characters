import { useState, useEffect } from 'react';

const useKeyboardShortcut = (
  combination: string,
  action = (_keyboardEvent: KeyboardEvent) => {}
) => {
  const [keyboardJS, setKeyboardJS] = useState(null);

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
