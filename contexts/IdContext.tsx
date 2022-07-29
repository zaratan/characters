import React, { createContext, ReactNode } from 'react';

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
