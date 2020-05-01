/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

export type RawAbilitiesListType = Array<{
  title: string;
  value: number;
  specialties?: Array<{ key: string; name: string }>;
  key?: string;
}>;
export type AbilityType = {
  title: string;
  value: number;
  specialties?: Array<{ key: string; name: string }>;
  baseSpecialtiesCount: number;
  key?: string;
  baseValue: number;
  set: (newValue: number) => void;
  addNewSpecialty: () => void;
  removeSpecialty: (key: string) => void;
  changeSpecialty: (key: string, newValue: string) => void;
};
export type AbilitiesListType = Array<AbilityType>;

export const convertRawAbilitiesToAbilities = (
  baseAbilities: RawAbilitiesListType,
  tmpAbilities: RawAbilitiesListType,
  setter: (newAbilities: RawAbilitiesListType) => void
) =>
  tmpAbilities.map((ability) => {
    const baseAbility = baseAbilities.find((abi) =>
      ability.key === undefined
        ? ability.title === abi.title
        : abi.key === ability.key
    );

    return {
      ...ability,
      set: (value: number) => {
        setter(
          tmpAbilities.map((a) =>
            (
              ability.key === undefined
                ? a.title === ability.title
                : ability.key === a.key
            )
              ? { ...a, value }
              : a
          )
        );
      },
      baseValue: (baseAbility && baseAbility.value) || 0,
      baseSpecialtiesCount:
        (baseAbility &&
          baseAbility.specialties &&
          baseAbility.specialties.length) ||
        0,
      addNewSpecialty: () => {
        setter(
          tmpAbilities.map((a) =>
            (
              ability.key === undefined
                ? a.title === ability.title
                : ability.key === a.key
            )
              ? {
                  ...a,
                  specialties: [
                    ...(ability.specialties || []),
                    { key: uuid(), name: '' },
                  ],
                }
              : a
          )
        );
      },
      removeSpecialty: (key: string) => {
        setter(
          tmpAbilities.map((a) =>
            (
              ability.key === undefined
                ? a.title === ability.title
                : ability.key === a.key
            )
              ? {
                  ...a,
                  specialties: (ability.specialties || []).filter(
                    (spec) => spec.key !== key
                  ),
                }
              : a
          )
        );
      },
      changeSpecialty: (key: string, newTitle: string) => {
        setter(
          tmpAbilities.map((a) =>
            (
              ability.key === undefined
                ? a.title === ability.title
                : ability.key === a.key
            )
              ? {
                  ...a,
                  specialties: (ability.specialties || []).map((spec) =>
                    spec.key !== key ? spec : { ...spec, name: newTitle }
                  ),
                }
              : a
          )
        );
      },
    };
  });

const generateAddNewCustomAbility: (
  customAbilities: RawAbilitiesListType,
  setter: (value: RawAbilitiesListType) => void
) => () => void = (customAbilities, setter) => () => {
  const key = uuid();
  setter([...customAbilities, { title: '', key, value: 0 }]);
};

const generateRemoveCustomAbility: (
  customAbilities: RawAbilitiesListType,
  setter: (value: RawAbilitiesListType) => void
) => (key: string) => () => void = (customAbilities, setter) => (key) => () => {
  setter(customAbilities.filter((ability) => ability.key !== key));
};

const generateChangeCustomAbilityTitle: (
  customAbilities: RawAbilitiesListType,
  setter: (value: RawAbilitiesListType) => void
) => (key: string) => (newTitle: string) => void = (
  customAbilities,
  setter
) => (key) => (newTitle) => {
  setter(
    customAbilities.map((ability) =>
      ability.key === key ? { ...ability, title: newTitle } : ability
    )
  );
};

const defaultContext: {
  talents: AbilitiesListType;
  customTalents: AbilitiesListType;
  addNewCustomTalent: () => void;
  removeCustomTalent: (key: string) => () => void;
  changeCustomTalentTitle: (key: string) => (newTitle: string) => void;
  skills: AbilitiesListType;
  customSkills: AbilitiesListType;
  addNewCustomSkill: () => void;
  removeCustomSkill: (key: string) => () => void;
  changeCustomSkillTitle: (key: string) => (newTitle: string) => void;
  knowledges: AbilitiesListType;
  customKnowledges: AbilitiesListType;
  addNewCustomKnowledge: () => void;
  removeCustomKnowledge: (key: string) => () => void;
  changeCustomKnowledgeTitle: (key: string) => (newTitle: string) => void;
} = {
  talents: [
    'Expression',
    'Vigilance',
    'Athlétisme',
    'Bagare',
    'Conscience',
    'Empathie',
    'Intimidation',
    'Passe-passe',
    'Commandement',
    'Subterfuge',
  ].map((title: string) => ({
    title,
    value: 0,
    set: () => {},
    addNewSpecialty: () => {},
    changeSpecialty: () => {},
    removeSpecialty: () => {},
    baseValue: 0,
    baseSpecialtiesCount: 0,
  })),

  customTalents: [],
  addNewCustomTalent: () => {},
  removeCustomTalent: () => () => {},
  changeCustomTalentTitle: () => () => {},
  skills: [
    'Animaux',
    'Archerie',
    'Artisanats',
    'Equitation',
    'Etiquette',
    'Furtivite',
    'Commerce',
    'Melee',
    'Représentation',
    'Survie',
  ].map((title: string) => ({
    title,
    value: 0,
    set: () => {},
    addNewSpecialty: () => {},
    changeSpecialty: () => {},
    removeSpecialty: () => {},
    baseValue: 0,
    baseSpecialtiesCount: 0,
  })),
  customSkills: [],
  addNewCustomSkill: () => {},
  removeCustomSkill: () => () => {},
  changeCustomSkillTitle: () => () => {},
  knowledges: [
    'Érudition',
    'Investigation',
    'Droit',
    'Linguistique',
    'Médecine',
    'Occulte',
    'Sagesse pop.',
    'Politique',
    'Senechal',
    'Theologie',
  ].map((title: string) => ({
    title,
    value: 0,
    set: () => {},
    addNewSpecialty: () => {},
    changeSpecialty: () => {},
    removeSpecialty: () => {},
    baseValue: 0,
    baseSpecialtiesCount: 0,
  })),
  customKnowledges: [],
  addNewCustomKnowledge: () => {},
  removeCustomKnowledge: () => () => {},
  changeCustomKnowledgeTitle: () => () => {},
};

const AbilitiesContext = createContext(defaultContext);

export const AbilitiesProvider = ({
  children,
  talents,
  customTalents,
  skills,
  customSkills,
  knowledges,
  customKnowledges,
}: {
  children: ReactNode;
  talents: RawAbilitiesListType;
  customTalents: RawAbilitiesListType;
  skills: RawAbilitiesListType;
  customSkills: RawAbilitiesListType;
  knowledges: RawAbilitiesListType;
  customKnowledges: RawAbilitiesListType;
}) => {
  const [tmpTalents, setTmpTalents] = useState(talents);
  const talentsCap = convertRawAbilitiesToAbilities(
    talents,
    tmpTalents,
    setTmpTalents
  );
  const [tmpCustomTalents, setTmpCustomTalents] = useState(customTalents);
  const customTalentsCap = convertRawAbilitiesToAbilities(
    customTalents,
    tmpCustomTalents,
    setTmpCustomTalents
  );
  const [tmpSkills, setTmpSkills] = useState(skills);
  const skillsCap = convertRawAbilitiesToAbilities(
    skills,
    tmpSkills,
    setTmpSkills
  );
  const [tmpCustomSkills, setTmpCustomSkills] = useState(customSkills);
  const customSkillsCap = convertRawAbilitiesToAbilities(
    customSkills,
    tmpCustomSkills,
    setTmpCustomSkills
  );
  const [tmpKnowledges, setTmpKnowledges] = useState(knowledges);
  const knowledgesCap = convertRawAbilitiesToAbilities(
    knowledges,
    tmpKnowledges,
    setTmpKnowledges
  );
  const [tmpCustomKnowledges, setTmpCustomKnowledges] = useState(
    customKnowledges
  );
  const customKnowledgesCap = convertRawAbilitiesToAbilities(
    customKnowledges,
    tmpCustomKnowledges,
    setTmpCustomKnowledges
  );
  return (
    <AbilitiesContext.Provider
      value={{
        talents: talentsCap,
        customTalents: customTalentsCap,
        addNewCustomTalent: generateAddNewCustomAbility(
          tmpCustomTalents,
          setTmpCustomTalents
        ),
        removeCustomTalent: generateRemoveCustomAbility(
          tmpCustomTalents,
          setTmpCustomTalents
        ),
        changeCustomTalentTitle: generateChangeCustomAbilityTitle(
          tmpCustomTalents,
          setTmpCustomTalents
        ),
        skills: skillsCap,
        customSkills: customSkillsCap,
        addNewCustomSkill: generateAddNewCustomAbility(
          tmpCustomSkills,
          setTmpCustomSkills
        ),
        removeCustomSkill: generateRemoveCustomAbility(
          tmpCustomSkills,
          setTmpCustomSkills
        ),
        changeCustomSkillTitle: generateChangeCustomAbilityTitle(
          tmpCustomSkills,
          setTmpCustomSkills
        ),
        knowledges: knowledgesCap,
        customKnowledges: customKnowledgesCap,
        addNewCustomKnowledge: generateAddNewCustomAbility(
          tmpCustomKnowledges,
          setTmpCustomKnowledges
        ),
        removeCustomKnowledge: generateRemoveCustomAbility(
          tmpCustomKnowledges,
          setTmpCustomKnowledges
        ),
        changeCustomKnowledgeTitle: generateChangeCustomAbilityTitle(
          tmpCustomKnowledges,
          setTmpCustomKnowledges
        ),
      }}
    >
      {children}
    </AbilitiesContext.Provider>
  );
};

export default AbilitiesContext;
