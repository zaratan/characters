'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect } from 'react';

type ContextType = {
  showPex: boolean;
  togglePex: () => void;
};

const defaultContext: ContextType = {
  showPex: false,
  togglePex: () => {},
};
const PreferencesContext = createContext(defaultContext);
export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [showPex, setShowPex] = useState(false);

  const togglePex = () => {
    const nextState = !showPex;
    localStorage.setItem(
      'PreferencesContext:showPex',
      JSON.stringify(nextState)
    );
    setShowPex(nextState);
  };

  useEffect(() => {
    const lsShowPex = JSON.parse(
      localStorage.getItem('PreferencesContext:showPex') ?? 'null'
    );
    if (lsShowPex) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read localStorage at mount
      setShowPex(lsShowPex);
    }
  }, []);

  const context: ContextType = { showPex, togglePex };
  return (
    <PreferencesContext.Provider value={context}>
      {children}
    </PreferencesContext.Provider>
  );
};

export default PreferencesContext;
