/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode } from 'react';
import { TempElemType } from '../types/TempElemType';

export interface InfosType {
  name: string;
  playerName: string;
  chronicle: string;
  nature: string;
  demeanor: string;
  clan: string;
  generation: number;
  haven: string;
  sire: string;
}

const defaultContext: {
  name: TempElemType<string>;
  playerName: TempElemType<string>;
  chronicle: TempElemType<string>;
  nature: TempElemType<string>;
  demeanor: TempElemType<string>;
  clan: TempElemType<string>;
  generation: TempElemType<number>;
  haven: TempElemType<string>;
  sire: TempElemType<string>;
} = {
  name: { value: '', set: () => {}, baseValue: '' },
  playerName: { value: '', set: () => {}, baseValue: '' },
  chronicle: { value: '', set: () => {}, baseValue: '' },
  nature: { value: '', set: () => {}, baseValue: '' },
  demeanor: { value: '', set: () => {}, baseValue: '' },
  clan: { value: '', set: () => {}, baseValue: '' },
  generation: { value: 12, set: () => {}, baseValue: 12 },
  haven: { value: '', set: () => {}, baseValue: '' },
  sire: { value: '', set: () => {}, baseValue: '' },
};

const InfosContext = createContext(defaultContext);
export const InfosProvider = ({
  children,
  infos,
}: {
  children: ReactNode;
  infos: InfosType;
}) => {
  const [name, setName] = useState(infos.name);
  const [playerName, setPlayerName] = useState(infos.playerName);
  const [chronicle, setChronicle] = useState(infos.chronicle);
  const [nature, setNature] = useState(infos.nature);
  const [demeanor, setDemeanor] = useState(infos.demeanor);
  const [clan, setClan] = useState(infos.clan);
  const [generation, setGeneration] = useState(infos.generation);
  const [haven, setHaven] = useState(infos.haven);
  const [sire, setSire] = useState(infos.sire);
  const tmpInfos = {
    name: { value: name, set: setName, baseValue: infos.name },
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
    nature: { value: nature, set: setNature, baseValue: infos.nature },
    demeanor: { value: demeanor, set: setDemeanor, baseValue: infos.demeanor },
    clan: { value: clan, set: setClan, baseValue: infos.clan },
    generation: {
      value: generation,
      set: setGeneration,
      baseValue: infos.generation,
    },
    haven: { value: haven, set: setHaven, baseValue: infos.haven },
    sire: { value: sire, set: setSire, baseValue: infos.sire },
  };
  return (
    <InfosContext.Provider value={tmpInfos}>{children}</InfosContext.Provider>
  );
};

export default InfosContext;
