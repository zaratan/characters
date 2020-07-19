/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode, useContext } from 'react';
import MeContext from './MeContext';

type ContextType = {
  editMode: boolean;
  playMode: boolean;
  toggleMode: () => void;
};

const defaultContext: ContextType = {
  editMode: true,
  playMode: false,
  toggleMode: () => {},
};

const ModeContext = createContext(defaultContext);
export const ModeProvider = ({
  children,
  startEdit = false,
  startPlay = true,
}: {
  children: ReactNode;
  startEdit?: boolean;
  startPlay?: boolean;
}) => {
  const { connected } = useContext(MeContext);

  const [editMode, setEditMode] = useState(connected ? startEdit : false);
  const [playMode, setPlayMode] = useState(connected ? startPlay : false);
  const toggleMode = connected
    ? () => {
        if (playMode && !editMode) {
          setEditMode(true);
          setPlayMode(false);
        } else {
          setEditMode(false);
          setPlayMode(true);
        }
      }
    : () => {};

  const context: ContextType = {
    editMode,
    playMode,
    toggleMode,
  };

  return (
    <ModeContext.Provider value={context}>{children}</ModeContext.Provider>
  );
};

export default ModeContext;
