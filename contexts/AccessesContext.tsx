/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, useEffect, ReactNode } from 'react';

type ContextType = {
  editors: Array<string>;
  addEditor: (sub: string) => void;
  removeEditor: (sub: string) => void;
};

const defaultContext: ContextType = {
  editors: [],
  addEditor: () => {
    throw new Error('SHOULD HAVE BEEN OVERRIDEN');
  },
  removeEditor: () => {
    throw new Error('SHOULD HAVE BEEN OVERRIDEN');
  },
};
const AccessesContext = createContext(defaultContext);
export const AccessesProvider = ({
  children,
  editors,
}: {
  children: ReactNode;
  editors: Array<string>;
}) => {
  const [editorsState, setEditorsState] = useState(editors);

  const addEditor = (sub: string) => {
    setEditorsState([...editorsState, sub]);
  };

  const removeEditor = (sub: string) => {
    setEditorsState(editorsState.filter((editor) => editor !== sub));
  };

  useEffect(() => {
    setEditorsState(editors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(editors)]);

  const context: ContextType = {
    editors: editorsState,
    addEditor,
    removeEditor,
  };

  return (
    <AccessesContext.Provider value={context}>
      {children}
    </AccessesContext.Provider>
  );
};

export default AccessesContext;
