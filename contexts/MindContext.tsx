/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode, useEffect } from 'react';
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
  const [willpower, setWillpower] = useState({
    val: mind.willpower,
    changed: false,
  });
  const [tempWillpower, setTempWillpower] = useState(mind.tempWillpower);
  const [bloodSpent, setBloodSpent] = useState(mind.bloodSpent);
  const [conscience, setConscience] = useState({
    val: mind.conscience,
    changed: false,
  });
  const [isConviction, setIsConviction] = useState(mind.isConviction);
  const [isInstinct, setIsInstinct] = useState(mind.isInstinct);
  const [selfControl, setSelfControl] = useState({
    val: mind.selfControl,
    changed: false,
  });
  const [courage, setCourage] = useState({ val: mind.courage, changed: false });
  const [pathName, setPathName] = useState(mind.pathName);
  const [path, setPath] = useState({ val: mind.path, changed: false });
  const [isExtraBruisable, setIsExtraBruisable] = useState(
    mind.isExtraBruisable
  );
  const [health, setHealth] = useState(mind.health);
  useEffect(() => {
    if (willpower.changed) return;
    setWillpower({ val: mind.willpower, changed: false });
  }, [mind.willpower]);
  useEffect(() => {
    setTempWillpower(mind.tempWillpower);
  }, [mind.tempWillpower]);
  useEffect(() => {
    setBloodSpent(mind.bloodSpent);
  }, [mind.bloodSpent]);
  useEffect(() => {
    if (conscience.changed) return;
    setConscience({ val: mind.conscience, changed: false });
  }, [mind.conscience]);
  useEffect(() => {
    setIsConviction(mind.isConviction);
  }, [mind.isConviction]);
  useEffect(() => {
    setIsInstinct(mind.isInstinct);
  }, [mind.isInstinct]);
  useEffect(() => {
    if (selfControl.changed) return;
    setSelfControl({ val: mind.selfControl, changed: false });
  }, [mind.selfControl]);
  useEffect(() => {
    if (courage.changed) return;
    setCourage({ val: mind.courage, changed: false });
  }, [mind.courage]);
  useEffect(() => {
    setPathName(mind.pathName);
  }, [mind.pathName]);
  useEffect(() => {
    if (path.changed) return;
    setPath({ val: mind.path, changed: false });
  }, [mind.path]);
  useEffect(() => {
    setIsExtraBruisable(mind.isExtraBruisable);
  }, [mind.isExtraBruisable]);
  useEffect(() => {
    setHealth(mind.health);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(mind.health)]);

  const tmpMind = {
    willpower: {
      value: willpower.val,
      set: (newWillpower) => setWillpower({ val: newWillpower, changed: true }),
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
      set: (newConscience) =>
        setConscience({ val: newConscience, changed: true }),
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
      set: (newSeflControl) =>
        setSelfControl({ val: newSeflControl, changed: true }),
      baseValue: mind.selfControl,
    },
    courage: {
      value: courage.val,
      set: (newCourage) => setCourage({ val: newCourage, changed: true }),
      baseValue: mind.courage,
    },
    pathName: { value: pathName, set: setPathName, baseValue: mind.pathName },
    path: {
      value: path.val,
      set: (newPath) => setPath({ val: newPath, changed: true }),
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
