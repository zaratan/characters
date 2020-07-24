/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { TempElemType } from '../types/TempElemType';

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
  const [localTrueFaith, setTrueFaith] = useState(trueFaith);
  useEffect(() => {
    setTrueFaith(trueFaith);
  }, [trueFaith]);
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
