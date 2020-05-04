/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode, useEffect } from 'react';
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
  const [tmpStrength, setTmpStrength] = useState({
    val: attributes.strength,
    changed: false,
  });
  useEffect(() => {
    if (tmpStrength.changed) return;
    setTmpStrength({ val: attributes.strength, changed: false });
  }, [attributes.strength]);
  const [tmpDexterity, setTmpDexterity] = useState({
    val: attributes.dexterity,
    changed: false,
  });
  useEffect(() => {
    if (tmpDexterity.changed) return;
    setTmpDexterity({ val: attributes.dexterity, changed: false });
  }, [attributes.dexterity]);
  const [tmpStamina, setTmpStamina] = useState({
    val: attributes.stamina,
    changed: false,
  });
  useEffect(() => {
    if (tmpStamina.changed) return;
    setTmpStamina({ val: attributes.stamina, changed: false });
  }, [attributes.stamina]);
  const [tmpCharisma, setTmpCharisma] = useState({
    val: attributes.charisma,
    changed: false,
  });
  useEffect(() => {
    if (tmpCharisma.changed) return;
    setTmpCharisma({ val: attributes.charisma, changed: false });
  }, [attributes.charisma]);
  const [tmpManipulation, setTmpManipulation] = useState({
    val: attributes.manipulation,
    changed: false,
  });
  useEffect(() => {
    if (tmpManipulation.changed) return;
    setTmpManipulation({ val: attributes.manipulation, changed: false });
  }, [attributes.manipulation]);
  const [tmpAppearance, setTmpAppearance] = useState({
    val: attributes.appearance,
    changed: false,
  });
  useEffect(() => {
    if (tmpAppearance.changed) return;
    setTmpAppearance({ val: attributes.appearance, changed: false });
  }, [attributes.appearance]);
  const [tmpIntelligence, setTmpIntelligence] = useState({
    val: attributes.intelligence,
    changed: false,
  });
  useEffect(() => {
    if (tmpIntelligence.changed) return;
    setTmpIntelligence({ val: attributes.intelligence, changed: false });
  }, [attributes.intelligence]);
  const [tmpPerception, setTmpPerception] = useState({
    val: attributes.perception,
    changed: false,
  });
  useEffect(() => {
    if (tmpPerception.changed) return;
    setTmpPerception({ val: attributes.perception, changed: false });
  }, [attributes.perception]);
  const [tmpWits, setTmpWits] = useState({
    val: attributes.wits,
    changed: false,
  });
  useEffect(() => {
    if (tmpWits.changed) return;
    setTmpWits({ val: attributes.wits, changed: false });
  }, [attributes.wits]);
  const tmpAttributes = {
    strength: {
      value: tmpStrength.val,
      set: (newStrength) => setTmpStrength({ val: newStrength, changed: true }),
      baseValue: attributes.strength,
    },
    dexterity: {
      value: tmpDexterity.val,
      set: (newDexterity) =>
        setTmpDexterity({ val: newDexterity, changed: true }),
      baseValue: attributes.dexterity,
    },
    stamina: {
      value: tmpStamina.val,
      set: (newStamina) => setTmpStamina({ val: newStamina, changed: true }),
      baseValue: attributes.stamina,
    },
    charisma: {
      value: tmpCharisma.val,
      set: (newCharisma) => setTmpCharisma({ val: newCharisma, changed: true }),
      baseValue: attributes.charisma,
    },
    manipulation: {
      value: tmpManipulation.val,
      set: (newManipulation) =>
        setTmpManipulation({ val: newManipulation, changed: true }),
      baseValue: attributes.manipulation,
    },
    appearance: {
      value: tmpAppearance.val,
      set: (newAppearance) =>
        setTmpAppearance({ val: newAppearance, changed: true }),
      baseValue: attributes.appearance,
    },
    intelligence: {
      value: tmpIntelligence.val,
      set: (newIntelligence) =>
        setTmpIntelligence({ val: newIntelligence, changed: true }),
      baseValue: attributes.intelligence,
    },
    perception: {
      value: tmpPerception.val,
      set: (newPerception) =>
        setTmpPerception({ val: newPerception, changed: true }),
      baseValue: attributes.perception,
    },
    wits: {
      value: tmpWits.val,
      set: (newWits) => setTmpWits({ val: newWits, changed: true }),
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
