/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { TempElemType } from '../types/TempElemType';
import useChangeWatcher from '../hooks/useChangeWatcher';
import { useStateWithChangesAndTracker } from '../hooks/useStateWithTracker';

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
  const [tmpStrength, setTmpStrength] = useStateWithChangesAndTracker(
    attributes.strength,
    'strength'
  );
  const [tmpDexterity, setTmpDexterity] = useStateWithChangesAndTracker(
    attributes.dexterity,
    'dexterity'
  );
  const [tmpStamina, setTmpStamina] = useStateWithChangesAndTracker(
    attributes.stamina,
    'stamina'
  );
  const [tmpCharisma, setTmpCharisma] = useStateWithChangesAndTracker(
    attributes.charisma,
    'charisma'
  );
  const [tmpManipulation, setTmpManipulation] = useStateWithChangesAndTracker(
    attributes.manipulation,
    'manipulation'
  );
  const [tmpAppearance, setTmpAppearance] = useStateWithChangesAndTracker(
    attributes.appearance,
    'appearance'
  );
  const [tmpIntelligence, setTmpIntelligence] = useStateWithChangesAndTracker(
    attributes.intelligence,
    'intelligence'
  );
  const [tmpPerception, setTmpPerception] = useStateWithChangesAndTracker(
    attributes.perception,
    'perception'
  );
  const [tmpWits, setTmpWits] = useStateWithChangesAndTracker(
    attributes.wits,
    'wits'
  );

  const tmpAttributes = {
    strength: {
      value: tmpStrength.val,
      set: setTmpStrength,
      baseValue: attributes.strength,
    },
    dexterity: {
      value: tmpDexterity.val,
      set: setTmpDexterity,
      baseValue: attributes.dexterity,
    },
    stamina: {
      value: tmpStamina.val,
      set: setTmpStamina,
      baseValue: attributes.stamina,
    },
    charisma: {
      value: tmpCharisma.val,
      set: setTmpCharisma,
      baseValue: attributes.charisma,
    },
    manipulation: {
      value: tmpManipulation.val,
      set: setTmpManipulation,
      baseValue: attributes.manipulation,
    },
    appearance: {
      value: tmpAppearance.val,
      set: setTmpAppearance,
      baseValue: attributes.appearance,
    },
    intelligence: {
      value: tmpIntelligence.val,
      set: setTmpIntelligence,
      baseValue: attributes.intelligence,
    },
    perception: {
      value: tmpPerception.val,
      set: setTmpPerception,
      baseValue: attributes.perception,
    },
    wits: {
      value: tmpWits.val,
      set: setTmpWits,
      baseValue: attributes.wits,
    },
  };
  return (
    <AttributesContext.Provider value={tmpAttributes}>
      {children}
    </AttributesContext.Provider>
  );
};

export default AttributesContext;
