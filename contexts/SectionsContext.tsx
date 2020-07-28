/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import produce from 'immer';

export type SectionsType = {
  blood: boolean;
  path: boolean;
  disciplines: boolean;
  generation: boolean;
  vampireInfos: boolean;
  trueFaith: boolean;
  humanMagic: boolean;
};

type ContextType = {
  useBlood: boolean;
  usePath: boolean;
  useDisciplines: boolean;
  useGeneration: boolean;
  useVampireInfos: boolean;
  useTrueFaith: boolean;
  useHumanMagic: boolean;
  toggleSection: (sectionName: string) => void;
};

const defaultContext: ContextType = {
  useBlood: true,
  usePath: true,
  useDisciplines: true,
  useGeneration: true,
  useVampireInfos: true,
  useTrueFaith: false,
  useHumanMagic: false,
  toggleSection: () => {},
};
const SectionsContext = createContext(defaultContext);
export const SectionsProvider = ({
  children,
  sections,
}: {
  children: ReactNode;
  sections?: {
    blood?: boolean;
    path?: boolean;
    disciplines?: boolean;
    generation?: boolean;
    vampireInfos?: boolean;
    trueFaith?: boolean;
    humanMagic?: boolean;
  };
}) => {
  const [sectionsState, setSectionsState] = useState(sections);

  const toggleSection = (sectionName: string) => {
    setSectionsState(
      produce(sectionsState, (nextState) => {
        nextState[sectionName] = !nextState[sectionName];
      })
    );
  };

  useEffect(() => {
    setSectionsState(sections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sections)]);

  const context: ContextType = {
    useBlood: sectionsState.blood,
    useDisciplines: sectionsState.disciplines,
    usePath: sectionsState.path,
    useGeneration: sectionsState.generation,
    useVampireInfos: sectionsState.vampireInfos,
    useTrueFaith: sectionsState.trueFaith,
    useHumanMagic: sectionsState.humanMagic,
    toggleSection,
  };
  return (
    <SectionsContext.Provider value={context}>
      {children}
    </SectionsContext.Provider>
  );
};

export default SectionsContext;
