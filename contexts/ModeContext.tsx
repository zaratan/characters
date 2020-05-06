/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode } from 'react';

type ContextType = {
  editMode: boolean;
  playMode: boolean;
  toggleMode: () => void;
};

const defaultContext: ContextType = {
  editMode: false,
  playMode: false,
  toggleMode: () => {},
};
const ModeContext = createContext(defaultContext);
export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const [editMode, setEditMode] = useState(false);
  const [playMode, setPlayMode] = useState(true);
  const toggleMode = () => {
    if (playMode && !editMode) {
      setEditMode(true);
      setPlayMode(false);
    } else {
      setEditMode(false);
      setPlayMode(true);
    }
  };
  const context: ContextType = { editMode, playMode, toggleMode };
  return (
    <ModeContext.Provider value={context}>{children}</ModeContext.Provider>
  );
};

export default ModeContext;
