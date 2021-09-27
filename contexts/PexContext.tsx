/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, ReactNode } from 'react';
import { TempElemType } from '../types/TempElemType';
import useStateWithChanges from '../hooks/useStateWithTracker';

type ContextType = {
  leftOver: TempElemType<number>;
};

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
  const [tmpLeftOverPex, setLeftOverPex] = useStateWithChanges(
    leftOverPex,
    'left-over-pex'
  );
  const context: ContextType = {
    leftOver: {
      value: tmpLeftOverPex,
      baseValue: leftOverPex,
      set: setLeftOverPex,
    },
  };
  return <PexContext.Provider value={context}>{children}</PexContext.Provider>;
};

export default PexContext;
