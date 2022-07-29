/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, ReactNode } from 'react';
import { TempElemType } from '../types/TempElemType';
import useStateWithTracker, {
  useStateWithChangesAndTracker,
} from '../hooks/useStateWithTracker';

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
  const [willpower, setWillpower] = useStateWithChangesAndTracker(
    mind.willpower,
    'willpower'
  );
  const [tempWillpower, setTempWillpower] = useStateWithTracker(
    mind.tempWillpower,
    'temp-willpower',
    {
      keepInChangeTracker: false,
    }
  );
  const [bloodSpent, setBloodSpent] = useStateWithTracker(
    mind.bloodSpent,
    'blood-spent',
    { keepInChangeTracker: false }
  );
  const [conscience, setConscience] = useStateWithChangesAndTracker(
    mind.conscience,
    'conscience'
  );
  const [isConviction, setIsConviction] = useStateWithTracker(
    mind.isConviction,
    'is-conviction'
  );
  const [isInstinct, setIsInstinct] = useStateWithTracker(
    mind.isInstinct,
    'is-instinct'
  );
  const [selfControl, setSelfControl] = useStateWithChangesAndTracker(
    mind.selfControl,
    'self-control'
  );
  const [courage, setCourage] = useStateWithChangesAndTracker(
    mind.courage,
    'courage'
  );
  const [pathName, setPathName] = useStateWithTracker(
    mind.pathName,
    'path-name'
  );
  const [path, setPath] = useStateWithChangesAndTracker(mind.path, 'path');
  const [isExtraBruisable, setIsExtraBruisable] = useStateWithTracker(
    mind.isExtraBruisable,
    'isExtraBruisable'
  );
  const [health, setHealth] = useStateWithTracker(mind.health, 'health', {
    keepInChangeTracker: false,
  });

  const tmpMind = {
    willpower: {
      value: willpower.val,
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
      value: conscience.val,
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
      value: selfControl.val,
      set: setSelfControl,
      baseValue: mind.selfControl,
    },
    courage: {
      value: courage.val,
      set: setCourage,
      baseValue: mind.courage,
    },
    pathName: {
      value: pathName,
      set: setPathName,
      baseValue: mind.pathName,
    },
    path: {
      value: path.val,
      set: setPath,
      baseValue: mind.path,
    },
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
