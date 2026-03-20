'use client';

import type { ReactNode } from 'react';
import React, { createContext } from 'react';

const defaultContext: {
  id: string;
} = {
  id: 'aabbccddeeff',
};
const IdContext = createContext(defaultContext);
export const IdProvider = ({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) => <IdContext.Provider value={{ id }}>{children}</IdContext.Provider>;

export default IdContext;
