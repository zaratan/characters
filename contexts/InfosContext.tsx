/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, ReactNode } from 'react';
import { TempElemType } from '../types/TempElemType';
import useStateWithTracker from '../hooks/useStateWithTracker';

export interface InfosType {
  name: string;
  playerName: string;
  chronicle: string;
  nature: string;
  demeanor: string;
  clan: string;
  haven: string;
  sire: string;
  era: number;
}

const defaultContext: {
  name: TempElemType<string>;
  playerName: TempElemType<string>;
  chronicle: TempElemType<string>;
  nature: TempElemType<string>;
  demeanor: TempElemType<string>;
  clan: TempElemType<string>;
  haven: TempElemType<string>;
  sire: TempElemType<string>;
  era: number;
} = {
  name: { value: '', set: () => {}, baseValue: '' },
  playerName: { value: '', set: () => {}, baseValue: '' },
  chronicle: { value: '', set: () => {}, baseValue: '' },
  nature: { value: '', set: () => {}, baseValue: '' },
  demeanor: { value: '', set: () => {}, baseValue: '' },
  clan: { value: '', set: () => {}, baseValue: '' },
  haven: { value: '', set: () => {}, baseValue: '' },
  sire: { value: '', set: () => {}, baseValue: '' },
  era: 0,
};

const InfosContext = createContext(defaultContext);
export const InfosProvider = ({
  children,
  infos,
}: {
  children: ReactNode;
  infos: InfosType;
}) => {
  const [name, setName] = useStateWithTracker(infos.name, 'name');
  const [playerName, setPlayerName] = useStateWithTracker(
    infos.playerName,
    'playerName'
  );
  const [chronicle, setChronicle] = useStateWithTracker(
    infos.chronicle,
    'chronicle'
  );
  const [nature, setNature] = useStateWithTracker(infos.nature, 'nature');
  const [demeanor, setDemeanor] = useStateWithTracker(
    infos.demeanor,
    'demeanor'
  );
  const [clan, setClan] = useStateWithTracker(infos.clan, 'clan');
  const [haven, setHaven] = useStateWithTracker(infos.haven, 'haven');
  const [sire, setSire] = useStateWithTracker(infos.sire, 'sire');
  const tmpInfos = {
    name: {
      value: name,
      set: setName,
      baseValue: infos.name,
    },
    playerName: {
      value: playerName,
      set: setPlayerName,
      baseValue: infos.playerName,
    },
    chronicle: {
      value: chronicle,
      set: setChronicle,
      baseValue: infos.chronicle,
    },
    nature: {
      value: nature,
      set: setNature,
      baseValue: infos.nature,
    },
    demeanor: {
      value: demeanor,
      set: setDemeanor,
      baseValue: infos.demeanor,
    },
    clan: {
      value: clan,
      set: setClan,
      baseValue: infos.clan,
    },
    haven: {
      value: haven,
      set: setHaven,
      baseValue: infos.haven,
    },
    sire: {
      value: sire,
      set: setSire,
      baseValue: infos.sire,
    },
    era: infos.era,
  };
  return (
    <InfosContext.Provider value={tmpInfos}>{children}</InfosContext.Provider>
  );
};

export default InfosContext;
