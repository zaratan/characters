'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useRef } from 'react';
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
    setSectionsState((prev) => ({
      ...prev,
      [sectionName]: !prev?.[sectionName as keyof typeof prev],
    }));
  };

  const prevSections = useRef(sections);
  useEffect(() => {
    if (!isEqual(prevSections.current, sections)) {
      prevSections.current = sections;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync props into state on deep change
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
