/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { TempElemType } from '../types/TempElemType';

type ContextType = { leftOver: TempElemType<number> };

const defaultContext: ContextType = {
  leftOver: {
    baseValue: 0,
    value: 0,
    set: () => {},
  },
};

const PexContext = createContext(defaultContext);

export const PexProvider = ({
  leftOverPex = 0,
  children,
}: {
  leftOverPex: number;
  children: ReactNode;
}) => {
  const [tmpLeftOverPex, setTmpLeftOverPex] = useState(leftOverPex);
  useEffect(() => {
    setTmpLeftOverPex(leftOverPex);
  }, [leftOverPex]);
  const context: ContextType = {
    leftOver: {
      value: tmpLeftOverPex,
      baseValue: leftOverPex,
      set: setTmpLeftOverPex,
    },
  };
  return <PexContext.Provider value={context}>{children}</PexContext.Provider>;
};

export default PexContext;
