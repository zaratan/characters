/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, useEffect, ReactNode } from 'react';

type ContextType = {
  editors: Array<string>;
  addEditor: (sub: string) => void;
  removeEditor: (sub: string) => void;
  viewers: Array<string>;
  addViewer: (sub: string) => void;
  removeViewer: (sub: string) => void;
  privateSheet: boolean;
  togglePrivate: () => void;
};

const defaultContext: ContextType = {
  editors: [],
  addEditor: () => {
    throw new Error('SHOULD HAVE BEEN OVERRIDEN');
  },
  removeEditor: () => {
    throw new Error('SHOULD HAVE BEEN OVERRIDEN');
  },
  viewers: [],
  addViewer: () => {
    throw new Error('SHOULD HAVE BEEN OVERRIDEN');
  },
  removeViewer: () => {
    throw new Error('SHOULD HAVE BEEN OVERRIDEN');
  },
  privateSheet: false,
  togglePrivate: () => {
    throw new Error('SHOULD HAVE BEEN OVERRIDEN');
  },
};
const AccessesContext = createContext(defaultContext);
export const AccessesProvider = ({
  children,
  editors,
  viewers,
  privateSheet,
}: {
  children: ReactNode;
  editors: Array<string>;
  viewers: Array<string>;
  privateSheet: boolean;
}) => {
  const [editorsState, setEditorsState] = useState(editors);
  const [viewersState, setViewersState] = useState(viewers);
  const [privateState, setPrivateState] = useState(privateSheet);

  const addEditor = (sub: string) => {
    setEditorsState([...editorsState, sub]);
  };

  const removeEditor = (sub: string) => {
    setEditorsState(editorsState.filter((editor) => editor !== sub));
  };

  const addViewer = (sub: string) => {
    setViewersState([...viewersState, sub]);
  };

  const removeViewer = (sub: string) => {
    setViewersState(viewersState.filter((viewer) => viewer !== sub));
  };

  const togglePrivate = () => setPrivateState(!privateState);

  useEffect(() => {
    setEditorsState(editors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(editors)]);

  useEffect(() => {
    setViewersState(viewers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(viewers)]);

  useEffect(() => {
    setPrivateState(privateSheet);
  }, [privateSheet]);

  const context: ContextType = {
    editors: editorsState,
    addEditor,
    removeEditor,
    viewers: viewersState,
    addViewer,
    removeViewer,
    privateSheet: privateState,
    togglePrivate,
  };

  return (
    <AccessesContext.Provider value={context}>
      {children}
    </AccessesContext.Provider>
  );
};

export default AccessesContext;
