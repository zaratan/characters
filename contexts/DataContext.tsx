/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, ReactNode } from 'react';
import useSWR from 'swr';

export type DisciplineDataType = {
  name: string;
  url: string;
  th: boolean;
};

type ContextType = {
  disciplines: Array<DisciplineDataType>;
};

const defaultContext: ContextType = {
  disciplines: [],
};
const DataContext = createContext(defaultContext);
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useSWR('/api/data/disciplines', {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
  });
  const context: ContextType = {
    disciplines: data?.disciplines || [],
  };
  return (
    <DataContext.Provider value={context}>{children}</DataContext.Provider>
  );
};

export default DataContext;
