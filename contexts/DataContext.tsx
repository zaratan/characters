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

export type AdvFlawDataType = {
  name: string;
  url: string;
  levels: Array<number>;
};

type ContextType = {
  disciplines: Array<DisciplineDataType>;
  disciplinesCombi: Array<DisciplineCombiDataType>;
  advantages: Array<AdvFlawDataType>;
  flaws: Array<AdvFlawDataType>;
};

const defaultContext: ContextType = {
  disciplines: [],
  disciplinesCombi: [],
  advantages: [],
  flaws: [],
};
const DataContext = createContext(defaultContext);
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { data: discData } = useSWR('/api/data/disciplines', {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
  });

  const { data: advFlawData } = useSWR<{
    advantages: Array<AdvFlawDataType>;
    flaws: Array<AdvFlawDataType>;
  }>('https://wod.zaratan.fr/api/characters/adv_flaws', {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
  });

  const advantagesNameSet = new Set();
  const advantages = advFlawData?.advantages?.reduce<Array<AdvFlawDataType>>(
    (res, nextAdvantage) => {
      if (!advantagesNameSet.has(nextAdvantage.name)) {
        advantagesNameSet.add(nextAdvantage.name);
        res.push(nextAdvantage);
      }
      return res;
    },
    []
  );

  const flawsNameSet = new Set();
  const flaws = advFlawData?.flaws?.reduce<Array<AdvFlawDataType>>(
    (res, nextFlaw) => {
      if (!advantagesNameSet.has(nextFlaw.name)) {
        advantagesNameSet.add(nextFlaw.name);
        res.push(nextFlaw);
      }
      return res;
    },
    []
  );

  const context: ContextType = {
    disciplines: discData?.disciplines || [],
    disciplinesCombi: discData?.disciplinesCombi || [],
    advantages,
    flaws,
  };

  return (
    <DataContext.Provider value={context}>{children}</DataContext.Provider>
  );
};

export default DataContext;
