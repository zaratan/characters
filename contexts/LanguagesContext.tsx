/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { TempElemType } from '../types/TempElemType';
import useStateWithTracker from '../hooks/useStateWithTracker';

export type RawLanguage = { value: string; key: string };
interface Language extends TempElemType<string> {
  key: string;
}

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
      baseValue: languages.find((lang) => lang.key === language.key)?.value,
      set: (newTitle: string) => {
        const newValue = tmpLanguages.map((lang) =>
          lang.key === language.key ? { ...lang, value: newTitle } : lang
        );
        setTmpLanguages(newValue);
      },
    })),
    addNewLanguage: () => {
      const newValue = [...tmpLanguages, { value: '', key: uuid() }];
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
