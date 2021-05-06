/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, ReactNode } from 'react';
import { UserProfile, useUser } from '@auth0/nextjs-auth0';

type ContextType = {
  me?: UserProfile;
  connected: boolean;
};

const defaultContext: ContextType = {
  connected: false,
};
const MeContext = createContext(defaultContext);
export const MeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const connected = !!user;
  const context: ContextType = { me: user, connected };
  return <MeContext.Provider value={context}>{children}</MeContext.Provider>;
};

export default MeContext;
