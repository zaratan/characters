'use client';

import type { ReactNode } from 'react';
import { createContext } from 'react';
import type { TempElemType } from '../types/TempElemType';
import useStateWithTracker from '../hooks/useStateWithTracker';

export type RawLanguage = { value: string; key: string };
type Language = {
  key: string;
} & TempElemType<string>;

const defaultContext: {
  languages: Array<Language>;
  addNewLanguage: () => void;
  removeLanguage: (key: string) => void;
} = {
  languages: [],
  addNewLanguage: () => {},
  removeLanguage: () => {},
};

const LanguagesContext = createContext(defaultContext);

export const LanguagesProvider = ({
  children,
  languages,
}: {
  languages: Array<RawLanguage>;
  children: ReactNode;
}) => {
  const [tmpLanguages, setTmpLanguages] = useStateWithTracker(
    languages,
    'languages'
  );
  const context: {
    languages: Array<Language>;
    addNewLanguage: () => void;
    removeLanguage: (key: string) => void;
  } = {
    languages: tmpLanguages.map((language) => ({
      ...language,
      baseValue:
        languages.find((lang) => lang.key === language.key)?.value ?? '',
      set: (newTitle: string) => {
        const newValue = tmpLanguages.map((lang) =>
          lang.key === language.key ? { ...lang, value: newTitle } : lang
        );
        setTmpLanguages(newValue);
      },
    })),
    addNewLanguage: () => {
      const newValue = [
        ...tmpLanguages,
        { value: '', key: crypto.randomUUID() },
      ];
      setTmpLanguages(newValue);
    },
    removeLanguage: (key: string) => {
      const newValue = tmpLanguages.filter((lang) => lang.key !== key);
      setTmpLanguages(newValue);
    },
  };
  return (
    <LanguagesContext.Provider value={context}>
      {children}
    </LanguagesContext.Provider>
  );
};

export default LanguagesContext;
