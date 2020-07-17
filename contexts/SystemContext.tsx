/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

type ContextType = { appId: string };

const defaultContext: ContextType = { appId: '' };
const SystemContext = createContext(defaultContext);
export const SystemProvider = ({ children }: { children: ReactNode }) => {
  const context: ContextType = { appId: uuid() };
  return (
    <SystemContext.Provider value={context}>{children}</SystemContext.Provider>
  );
};

export default SystemContext;
