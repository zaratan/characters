/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, useEffect, ReactNode } from 'react';

type ContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const defaultContext: ContextType = {
  darkMode: false,
  toggleDarkMode: () => {
    throw new Error('OVERRIDE ME');
  },
};
const ThemeContext = createContext(defaultContext);
export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const lsDarkMode = JSON.parse(
      localStorage.getItem('ThemeContext:darkMode')
    );
    if (lsDarkMode !== undefined && lsDarkMode !== null) {
      setDarkMode(lsDarkMode);
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    localStorage.setItem('ThemeContext:darkMode', String(!darkMode));
    setDarkMode(!darkMode);
  };

  const context: ContextType = {
    darkMode,
    toggleDarkMode,
  };
  return (
    <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
