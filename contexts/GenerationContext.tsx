import React, { createContext, ReactNode } from 'react';
import { TempElemType } from '../types/TempElemType';
import useStateWithTracker from '../hooks/useStateWithTracker';

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
  const [localGeneration, setGeneration] = useStateWithTracker(
    generation,
    'generation'
  );
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
