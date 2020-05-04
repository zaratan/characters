/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { TempElemType } from '../types/TempElemType';

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
  const [tmpLanguages, setTmpLanguages] = useState(languages);
  useEffect(() => {
    setTmpLanguages(languages);
  }, [JSON.stringify(languages)]);
  const context: {
    languages: Array<Language>;
    addNewLanguage: () => void;
    removeLanguage: (key: string) => void;
  } = {
    languages: tmpLanguages.map((language) => ({
      ...language,
      baseValue: languages.find((lang) => lang.key === language.key)?.value,
      set: (newValue: string) =>
        setTmpLanguages(
          tmpLanguages.map((lang) =>
            lang.key === language.key ? { ...lang, value: newValue } : lang
          )
        ),
    })),
    addNewLanguage: () => {
      setTmpLanguages([...tmpLanguages, { value: '', key: uuid() }]);
    },
    removeLanguage: (key: string) => {
      setTmpLanguages(tmpLanguages.filter((lang) => lang.key !== key));
    },
  };
  return (
    <LanguagesContext.Provider value={context}>
      {children}
    </LanguagesContext.Provider>
  );
};

export default LanguagesContext;
