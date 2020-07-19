/* eslint-disable @typescript-eslint/no-empty-function */
import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from 'react';
import MeContext from './MeContext';

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
  useEffect(() => {
    setEditMode(false);
    setPlayMode(connected);
  }, [connected]);
  const toggleMode = connected
    ? () => {
        console.log({ playMode, editMode });

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
