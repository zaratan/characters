/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { TempElemType } from '../types/TempElemType';

const defaultContext: TempElemType<number> = {
  value: 12,
  set: () => {},
  baseValue: 12,
};
const GenerationContext = createContext(defaultContext);
export const GenerationProvider = ({
  children,
  generation,
}: {
  children: ReactNode;
  generation: number;
}) => {
  const [localGeneration, setGeneration] = useState(generation);
  useEffect(() => {
    setGeneration(generation);
  }, [generation]);
  const tmpGeneration = {
    value: localGeneration,
    set: setGeneration,
    baseValue: generation,
  };
  return (
    <GenerationContext.Provider value={tmpGeneration}>
      {children}
    </GenerationContext.Provider>
  );
};

export default GenerationContext;
