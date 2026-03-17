'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

type ContextType = {
  editors: Array<string>;
  addEditor: (id: string) => void;
  removeEditor: (id: string) => void;
  viewers: Array<string>;
  addViewer: (id: string) => void;
  removeViewer: (id: string) => void;
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

  const addEditor = (id: string) => {
    setEditorsState([...editorsState, id]);
  };

  const removeEditor = (id: string) => {
    setEditorsState(editorsState.filter((editor) => editor !== id));
  };

  const addViewer = (id: string) => {
    setViewersState([...viewersState, id]);
  };

  const removeViewer = (id: string) => {
    setViewersState(viewersState.filter((viewer) => viewer !== id));
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
