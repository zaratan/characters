/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode, useEffect } from 'react';

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
      localStorage.getItem('PreferencesContext:showPex')
    );
    if (lsShowPex) {
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
