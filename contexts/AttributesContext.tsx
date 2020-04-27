/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode } from 'react';
import { TempElemType } from '../types/TempElemType';

export interface AttributesType {
  strength: number;
  dexterity: number;
  stamina: number;
  charisma: number;
  manipulation: number;
  appearance: number;
  perception: number;
  intelligence: number;
  wits: number;
}
const defaultContext: {
  strength: TempElemType<number>;
  dexterity: TempElemType<number>;
  stamina: TempElemType<number>;
  charisma: TempElemType<number>;
  manipulation: TempElemType<number>;
  appearance: TempElemType<number>;
  perception: TempElemType<number>;
  intelligence: TempElemType<number>;
  wits: TempElemType<number>;
} = {
  strength: { value: 1, set: () => {}, baseValue: 1 },
  dexterity: { value: 1, set: () => {}, baseValue: 1 },
  stamina: { value: 1, set: () => {}, baseValue: 1 },
  charisma: { value: 1, set: () => {}, baseValue: 1 },
  manipulation: { value: 1, set: () => {}, baseValue: 1 },
  appearance: { value: 1, set: () => {}, baseValue: 1 },
  perception: { value: 1, set: () => {}, baseValue: 1 },
  intelligence: { value: 1, set: () => {}, baseValue: 1 },
  wits: { value: 1, set: () => {}, baseValue: 1 },
};

const AttributesContext = createContext(defaultContext);

export const AttributesProvider = ({
  children,
  attributes,
}: {
  children: ReactNode;
  attributes: AttributesType;
}) => {
  const [tmpStrength, setTmpStrength] = useState(attributes.strength);
  const [tmpDexterity, setTmpDexterity] = useState(attributes.dexterity);
  const [tmpStamina, setTmpStamina] = useState(attributes.stamina);
  const [tmpCharisma, setTmpCharisma] = useState(attributes.charisma);
  const [tmpManipulation, setTmpManipulation] = useState(
    attributes.manipulation
  );
  const [tmpAppearance, setTmpAppearance] = useState(attributes.appearance);
  const [tmpIntelligence, setTmpIntelligence] = useState(
    attributes.intelligence
  );
  const [tmpPerception, setTmpPerception] = useState(attributes.perception);
  const [tmpWits, setTmpWits] = useState(attributes.wits);
  const tmpAttributes = {
    strength: {
      value: tmpStrength,
      set: setTmpStrength,
      baseValue: attributes.strength,
    },
    dexterity: {
      value: tmpDexterity,
      set: setTmpDexterity,
      baseValue: attributes.dexterity,
    },
    stamina: {
      value: tmpStamina,
      set: setTmpStamina,
      baseValue: attributes.stamina,
    },
    charisma: {
      value: tmpCharisma,
      set: setTmpCharisma,
      baseValue: attributes.charisma,
    },
    manipulation: {
      value: tmpManipulation,
      set: setTmpManipulation,
      baseValue: attributes.manipulation,
    },
    appearance: {
      value: tmpAppearance,
      set: setTmpAppearance,
      baseValue: attributes.appearance,
    },
    intelligence: {
      value: tmpIntelligence,
      set: setTmpIntelligence,
      baseValue: attributes.intelligence,
    },
    perception: {
      value: tmpPerception,
      set: setTmpPerception,
      baseValue: attributes.perception,
    },
    wits: { value: tmpWits, set: setTmpWits, baseValue: attributes.wits },
  };
  return (
    <AttributesContext.Provider value={tmpAttributes}>
      {children}
    </AttributesContext.Provider>
  );
};

export default AttributesContext;
