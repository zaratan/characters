/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { TempElemType } from '../types/TempElemType';

export type AdvFlawType = {
  key: string;
  title: string;
  value: number;
};

export interface AdvantagesFlawsType extends TempElemType<number> {
  title: string;
  key: string;
  setTitle: (newTitle: string) => void;
}

const defaultContext: {
  advantages: Array<AdvantagesFlawsType>;
  flaws: Array<AdvantagesFlawsType>;
  addNewAdvantage: () => void;
  removeAdvantage: (key: string) => void;
  addNewFlaw: () => void;
  removeFlaw: (key: string) => void;
} = {
  advantages: [],
  flaws: [],
  addNewAdvantage: () => {},
  removeAdvantage: () => {},
  addNewFlaw: () => {},
  removeFlaw: () => {},
};
const AdvFlawContext = createContext(defaultContext);
export const AdvFlawProvider = ({
  children,
  advantages = [],
  flaws = [],
}: {
  children: ReactNode;
  advantages: Array<AdvFlawType>;
  flaws: Array<AdvFlawType>;
}) => {
  const [tmpAdvantages, setTmpAdvantages] = useState(advantages);
  useEffect(() => {
    setTmpAdvantages(advantages);
  }, [JSON.stringify(advantages)]);
  const [tmpFlaws, setTmpFlaws] = useState(flaws);
  useEffect(() => {
    setTmpFlaws(flaws);
  }, [JSON.stringify(flaws)]);
  const context: {
    advantages: Array<AdvantagesFlawsType>;
    flaws: Array<AdvantagesFlawsType>;
    addNewAdvantage: () => void;
    removeAdvantage: (key: string) => void;
    addNewFlaw: () => void;
    removeFlaw: (key: string) => void;
  } = {
    advantages: tmpAdvantages.map((advantage) => ({
      ...advantage,
      baseValue:
        advantages.find((adv) => adv.key === advantage.key)?.value || 0,
      setTitle: (newTitle: string) => {
        setTmpAdvantages(
          tmpAdvantages.map((adv) =>
            advantage.key === adv.key ? { ...adv, title: newTitle } : adv
          )
        );
      },
      set: (newValue: number) => {
        setTmpAdvantages(
          tmpAdvantages.map((adv) =>
            advantage.key === adv.key ? { ...adv, value: newValue } : adv
          )
        );
      },
    })),
    flaws: tmpFlaws.map((flaw) => ({
      ...flaw,
      baseValue: flaws.find((flw) => flw.key === flaw.key)?.value || 0,
      setTitle: (newTitle: string) => {
        setTmpFlaws(
          tmpFlaws.map((flw) =>
            flaw.key === flw.key ? { ...flw, title: newTitle } : flw
          )
        );
      },
      set: (newValue: number) => {
        setTmpFlaws(
          tmpFlaws.map((flw) =>
            flaw.key === flw.key ? { ...flw, value: newValue } : flw
          )
        );
      },
    })),
    addNewAdvantage: () => {
      setTmpAdvantages([
        ...tmpAdvantages,
        { key: uuid(), value: 0, title: '' },
      ]);
    },
    addNewFlaw: () => {
      setTmpFlaws([...tmpFlaws, { key: uuid(), value: 0, title: '' }]);
    },
    removeAdvantage: (key: string) => {
      setTmpAdvantages(tmpAdvantages.filter((adv) => adv.key !== key));
    },
    removeFlaw: (key: string) => {
      setTmpFlaws(tmpFlaws.filter((flw) => flw.key !== key));
    },
  };
  return (
    <AdvFlawContext.Provider value={context}>
      {children}
    </AdvFlawContext.Provider>
  );
};

export default AdvFlawContext;
