/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode } from 'react';
import { TempElemType } from '../types/TempElemType';

export type MindType = {
  willpower: number;
  tempWillpower: number;
  bloodSpent: number;
  conscience: number;
  isConviction: boolean;
  isInstinct: boolean;
  selfControl: number;
  courage: number;
  pathName: string;
  path: number;
  isExtraBruisable: boolean;
  health: Array<number>;
};

const defaultContext: {
  willpower: TempElemType<number>;
  tempWillpower: TempElemType<number>;
  bloodSpent: TempElemType<number>;
  conscience: TempElemType<number>;
  isConviction: TempElemType<boolean>;
  selfControl: TempElemType<number>;
  isInstinct: TempElemType<boolean>;
  courage: TempElemType<number>;
  pathName: TempElemType<string>;
  path: TempElemType<number>;
  isExtraBruisable: TempElemType<boolean>;
  health: TempElemType<Array<number>>;
} = {
  willpower: { value: 1, set: () => {}, baseValue: 1 },
  tempWillpower: { value: 0, set: () => {}, baseValue: 0 },
  bloodSpent: { value: 0, set: () => {}, baseValue: 0 },
  conscience: { value: 1, set: () => {}, baseValue: 1 },
  isConviction: { value: false, set: () => {}, baseValue: false },
  selfControl: { value: 1, set: () => {}, baseValue: 1 },
  isInstinct: { value: false, set: () => {}, baseValue: false },
  courage: { value: 1, set: () => {}, baseValue: 1 },
  pathName: { value: '', set: () => {}, baseValue: '' },
  path: { value: 1, set: () => {}, baseValue: 1 },
  isExtraBruisable: { value: false, set: () => {}, baseValue: false },
  health: {
    value: [0, 0, 0, 0, 0, 0, 0, 0],
    set: () => {},
    baseValue: [0, 0, 0, 0, 0, 0, 0, 0],
  },
};

const MindContext = createContext(defaultContext);

export const MindProvider = ({
  children,
  mind,
}: {
  children: ReactNode;
  mind: MindType;
}) => {
  const [willpower, setWillpower] = useState(mind.willpower);
  const [tempWillpower, setTempWillpower] = useState(mind.tempWillpower);
  const [bloodSpent, setBloodSpent] = useState(mind.bloodSpent);
  const [conscience, setConscience] = useState(mind.conscience);
  const [isConviction, setIsConviction] = useState(mind.isConviction);
  const [isInstinct, setIsInstinct] = useState(mind.isInstinct);
  const [selfControl, setSelfControl] = useState(mind.selfControl);
  const [courage, setCourage] = useState(mind.courage);
  const [pathName, setPathName] = useState(mind.pathName);
  const [path, setPath] = useState(mind.path);
  const [isExtraBruisable, setIsExtraBruisable] = useState(
    mind.isExtraBruisable
  );
  const [health, setHealth] = useState(mind.health);
  const tmpMind = {
    willpower: {
      value: willpower,
      set: setWillpower,
      baseValue: mind.willpower,
    },
    tempWillpower: {
      value: tempWillpower,
      set: setTempWillpower,
      baseValue: mind.tempWillpower,
    },
    bloodSpent: {
      value: bloodSpent,
      set: setBloodSpent,
      baseValue: mind.bloodSpent,
    },
    conscience: {
      value: conscience,
      set: setConscience,
      baseValue: mind.conscience,
    },
    isConviction: {
      value: isConviction,
      set: setIsConviction,
      baseValue: mind.isConviction,
    },
    isInstinct: {
      value: isInstinct,
      set: setIsInstinct,
      baseValue: mind.isInstinct,
    },
    selfControl: {
      value: selfControl,
      set: setSelfControl,
      baseValue: mind.selfControl,
    },
    courage: { value: courage, set: setCourage, baseValue: mind.courage },
    pathName: { value: pathName, set: setPathName, baseValue: mind.pathName },
    path: { value: path, set: setPath, baseValue: mind.path },
    isExtraBruisable: {
      value: isExtraBruisable,
      set: setIsExtraBruisable,
      baseValue: mind.isExtraBruisable,
    },
    health: {
      value: health,
      set: setHealth,
      baseValue: mind.health,
    },
  };
  return (
    <MindContext.Provider value={tmpMind}>{children}</MindContext.Provider>
  );
};

export default MindContext;
