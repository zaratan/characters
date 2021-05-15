/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, ReactNode } from 'react';
import useSWR from 'swr';

export type DisciplineDataType = {
  name: string;
  url: string;
  th: boolean;
};

export type DisciplineCombiDataType = {
  name: string;
  url: string;
};

type ContextType = {
  disciplines: Array<DisciplineDataType>;
  disciplinesCombi: Array<DisciplineCombiDataType>;
};

const defaultContext: ContextType = {
  disciplines: [],
  disciplinesCombi: [],
};
const DataContext = createContext(defaultContext);
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useSWR('/api/data/disciplines', {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
  });
  const context: ContextType = {
    disciplines: data?.disciplines || [],
    disciplinesCombi: data?.disciplinesCombi || [],
  };
  return (
    <DataContext.Provider value={context}>{children}</DataContext.Provider>
  );
};

export default DataContext;
