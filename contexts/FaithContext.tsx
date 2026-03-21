'use client';

import type { ReactNode } from 'react';
import { createContext } from 'react';
import type { TempElemType } from '../types/TempElemType';
import useStateWithTracker from '../hooks/useStateWithTracker';

type ContextType = { trueFaith: TempElemType<number> };

const defaultContext: ContextType = {
  trueFaith: { baseValue: 0, set: () => {}, value: 0 },
};
const FaithContext = createContext(defaultContext);
export const FaithProvider = ({
  children,
  trueFaith,
}: {
  children: ReactNode;
  trueFaith: number;
}) => {
  const [localTrueFaith, setTrueFaith] = useStateWithTracker(
    trueFaith,
    'trueFaith'
  );
  const context: ContextType = {
    trueFaith: {
      baseValue: trueFaith,
      set: setTrueFaith,
      value: localTrueFaith,
    },
  };
  return (
    <FaithContext.Provider value={context}>{children}</FaithContext.Provider>
  );
};

export default FaithContext;
