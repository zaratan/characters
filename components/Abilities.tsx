import React, { useContext } from 'react';
import { StyledLine } from '../styles/Lines';
import { AbilityLine } from './Line';
import { HorizontalSection } from '../styles/Sections';
import { maxDot } from '../helpers/maxLevels';
import ColumnTitleWithOptions from './ColumnTitleWithOptions';
import AbilitiesContext, {
  AbilitiesListType,
} from '../contexts/AbilitiesContext';
import InfosContext from '../contexts/InfosContext';

const AbilitiesColumn = ({
  abilities,
  customAbilities,
  title,
  maxLevel,
  addNewCustomAbility,
  removeCustomAbility,
  changeCustomAbilityTitle,
}: {
  abilities: AbilitiesListType;
  customAbilities: AbilitiesListType;
  title: string;
  maxLevel: number;
  addNewCustomAbility: () => void;
  removeCustomAbility: (key: string) => () => void;
  changeCustomAbilityTitle: (key: string) => (newTitle: string) => void;
}) => (
  <div>
    <ColumnTitleWithOptions
      title={title}
      actions={[
        {
          name: `Ajouter ${title.match(/alent/) ? 'un' : 'une'} ${title.slice(
            0,
            -1
          )}`,
          value: addNewCustomAbility,
        },
      ]}
    />
    {abilities.map((ability) => (
      <AbilityLine
        title={ability.title}
        elem={ability}
        maxLevel={maxLevel}
        key={ability.title}
      />
    ))}
    {customAbilities.map((ability) => (
      <AbilityLine
        title={ability.title}
        elem={ability}
        maxLevel={maxLevel}
        key={ability.key}
        custom
        changeTitle={changeCustomAbilityTitle(ability.key)}
        remove={removeCustomAbility(ability.key)}
      />
    ))}
  </div>
);

const Abilities = () => {
  const {
    talents,
    customTalents,
    addNewCustomTalent,
    removeCustomTalent,
    changeCustomTalentTitle,
    skills,
    customSkills,
    addNewCustomSkill,
    removeCustomSkill,
    changeCustomSkillTitle,
    knowledges,
    customKnowledges,
    addNewCustomKnowledge,
    removeCustomKnowledge,
    changeCustomKnowledgeTitle,
  } = useContext(AbilitiesContext);
  const { generation } = useContext(InfosContext);
  const maxLevel = maxDot(generation.value);
  return (
    <>
      <StyledLine title="Capacités" />
      <HorizontalSection>
        <AbilitiesColumn
          title="Talents"
          abilities={talents}
          customAbilities={customTalents}
          maxLevel={maxLevel}
          addNewCustomAbility={addNewCustomTalent}
          removeCustomAbility={removeCustomTalent}
          changeCustomAbilityTitle={changeCustomTalentTitle}
        />
        <AbilitiesColumn
          title="Compétences"
          abilities={skills}
          customAbilities={customSkills}
          maxLevel={maxLevel}
          addNewCustomAbility={addNewCustomSkill}
          removeCustomAbility={removeCustomSkill}
          changeCustomAbilityTitle={changeCustomSkillTitle}
        />
        <AbilitiesColumn
          title="Connaissances"
          abilities={knowledges}
          customAbilities={customKnowledges}
          maxLevel={maxLevel}
          addNewCustomAbility={addNewCustomKnowledge}
          removeCustomAbility={removeCustomKnowledge}
          changeCustomAbilityTitle={changeCustomKnowledgeTitle}
        />
      </HorizontalSection>
    </>
  );
};

export default Abilities;
