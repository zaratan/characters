/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, ReactNode } from 'react';
import { MeType } from '../types/MeType';
import { useMe } from '../hooks/useMe';

type ContextType = {
  me?: MeType;
  connected: boolean;
};

const defaultContext: ContextType = {
  connected: false,
};
const MeContext = createContext(defaultContext);
export const MeProvider = ({ children }: { children: ReactNode }) => {
  const me = useMe();
  const connected = me?.auth;
  const context: ContextType = { me, connected };
  return <MeContext.Provider value={context}>{children}</MeContext.Provider>;
};

export default MeContext;
