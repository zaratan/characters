'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useRef } from 'react';
import produce from 'immer';
import isEqual from 'lodash/isEqual';

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
  toggleSection: (sectionName: string) => () => void;
};

const defaultContext: ContextType = {
  useBlood: true,
  usePath: true,
  useDisciplines: true,
  useGeneration: true,
  useVampireInfos: true,
  useTrueFaith: false,
  useHumanMagic: false,
  toggleSection: () => () => {},
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

  const toggleSection = (sectionName: string) => () => {
    setSectionsState(
      produce(sectionsState, (nextState) => {
        nextState![sectionName] = !nextState![sectionName];
      })
    );
  };

  const prevSections = useRef(sections);
  useEffect(() => {
    if (!isEqual(prevSections.current, sections)) {
      prevSections.current = sections;
      setSectionsState(sections);
    }
  }, [sections]);

  const context: ContextType = {
    useBlood: sectionsState?.blood ?? false,
    useDisciplines: sectionsState?.disciplines ?? false,
    usePath: sectionsState?.path ?? false,
    useGeneration: sectionsState?.generation ?? false,
    useVampireInfos: sectionsState?.vampireInfos ?? false,
    useTrueFaith: sectionsState?.trueFaith ?? false,
    useHumanMagic: sectionsState?.humanMagic ?? false,
    toggleSection,
  };
  return (
    <SectionsContext.Provider value={context}>
      {children}
    </SectionsContext.Provider>
  );
};

export default SectionsContext;
