/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

export type RawAbilitiesListType = Array<{
  title: string;
  value: number;
  key?: string;
}>;
export type AbilityType = {
  title: string;
  value: number;
  key?: string;
  baseValue: number;
  set: (newValue: number) => void;
};
export type AbilitiesListType = Array<AbilityType>;

export const convertRawAbilitiesToAbilities = (
  baseAbilities: RawAbilitiesListType,
  tmpAbilities: RawAbilitiesListType,
  setter: (newAbilities: RawAbilitiesListType) => void
) =>
  tmpAbilities.map((ability, i) => ({
    ...ability,
    set: (value: number) => {
      setter(
        tmpAbilities.map((a) =>
          a.title === ability.title ? { ...a, value } : a
        )
      );
    },
    baseValue: (baseAbilities[i] && baseAbilities[i].value) || 0,
  }));

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
    { title: 'Expression', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Vigilance', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Athlétisme', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Bagare', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Conscience', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Empathie', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Intimidation', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Passe-passe', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Commandement', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Subterfuge', value: 0, set: () => {}, baseValue: 0 },
  ],

  customTalents: [],
  addNewCustomTalent: () => {},
  removeCustomTalent: () => () => {},
  changeCustomTalentTitle: () => () => {},
  skills: [
    { title: 'Animaux', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Archerie', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Artisanats', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Equitation', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Etiquette', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Furtivite', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Commerce', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Melee', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Représentation', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Survie', value: 0, set: () => {}, baseValue: 0 },
  ],
  customSkills: [],
  addNewCustomSkill: () => {},
  removeCustomSkill: () => () => {},
  changeCustomSkillTitle: () => () => {},
  knowledges: [
    { title: 'Érudition', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Investigation', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Droit', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Linguistique', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Médecine', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Occulte', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Sagesse pop.', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Politique', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Senechal', value: 0, set: () => {}, baseValue: 0 },
    { title: 'Theologie', value: 0, set: () => {}, baseValue: 0 },
  ],
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
