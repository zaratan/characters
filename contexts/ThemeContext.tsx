'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect } from 'react';

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
      localStorage.getItem('ThemeContext:darkMode') ?? 'null'
    );
    if (lsDarkMode !== undefined && lsDarkMode !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read localStorage at mount
      setDarkMode(lsDarkMode);
      document.documentElement.classList.toggle('dark', lsDarkMode);
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    localStorage.setItem('ThemeContext:darkMode', String(next));
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
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
