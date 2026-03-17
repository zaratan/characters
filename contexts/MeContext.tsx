'use client';

import React, { createContext, ReactNode, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { MeType } from '../types/MeType';

type ContextType = {
  me?: MeType;
  connected: boolean;
};

const defaultContext: ContextType = {
  connected: false,
};
const MeContext = createContext(defaultContext);
export const MeProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();

  const value = useMemo(
    () => ({
      me: session?.user
        ? {
            id: session.user.id,
            name: session.user.name ?? '',
            email: session.user.email ?? '',
            image: session.user.image ?? '',
            isAdmin: session.user.isAdmin ?? false,
          }
        : undefined,
      connected: status === 'authenticated',
    }),
    [session, status]
  );

  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
};

export default MeContext;
