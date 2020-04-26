import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { StyledLine } from '../styles/Lines';
import { AbilityLine } from './Line';
import { HorizontalSection } from '../styles/Sections';
import { maxDot } from '../helpers/maxLevels';
import ColumnTitleWithOptions from './ColumnTitleWithOptions';

export type AbilitiesListType = Array<{ title: string; value: number }>;
export type CustomAbilitiesListType = Array<{
  title: string;
  value: number;
  key: string;
}>;

const AbilitiesColumn = ({
  abilities,
  customAbilities = [],
  title,
  maxLevel,
}: {
  abilities: AbilitiesListType;
  customAbilities?: CustomAbilitiesListType;
  title: string;
  maxLevel: number;
}) => {
  const [localCustomAbilities, setLocalCustomAbilities] = useState(
    customAbilities
  );
  const changeTitle = (key: string) => (newValue: string) => {
    setLocalCustomAbilities(
      localCustomAbilities.map((ability) =>
        ability.key === key ? { ...ability, title: newValue } : ability
      )
    );
  };
  const removeCustom = (key: string) => () => {
    console.log({ key });

    setLocalCustomAbilities(
      localCustomAbilities.filter((ability) => ability.key !== key)
    );
  };
  const addNewCustomEntity = () => {
    setLocalCustomAbilities([
      ...localCustomAbilities,
      { title: '', value: 0, key: uuid() },
    ]);
  };
  return (
    <div>
      <ColumnTitleWithOptions
        title={title}
        actions={[
          {
            name: `Ajouter ${title.match(/alent/) ? 'un' : 'une'} ${title.slice(
              0,
              -1
            )}`,
            value: addNewCustomEntity,
          },
        ]}
      />
      {abilities.map((ability) => (
        <AbilityLine
          title={ability.title}
          value={ability.value}
          maxLevel={maxLevel}
          key={ability.title}
        />
      ))}
      {localCustomAbilities.map((ability) => (
        <AbilityLine
          title={ability.title}
          value={ability.value}
          maxLevel={maxLevel}
          key={ability.key}
          custom
          changeTitle={changeTitle(ability.key)}
          remove={removeCustom(ability.key)}
        />
      ))}
    </div>
  );
};

const Abilities = ({
  talents,
  skills,
  knowledges,
  generation = 12,
  customKnowkedges = [],
  customSkills = [],
  customTalents = [],
}: {
  talents: AbilitiesListType;
  skills: AbilitiesListType;
  knowledges: AbilitiesListType;
  customTalents?: CustomAbilitiesListType;
  customSkills?: CustomAbilitiesListType;
  customKnowkedges?: CustomAbilitiesListType;
  generation?: number;
}) => {
  const maxLevel = maxDot(generation);
  return (
    <>
      <StyledLine title="Capacités" />
      <HorizontalSection>
        <AbilitiesColumn
          title="Talents"
          abilities={talents}
          customAbilities={customTalents}
          maxLevel={maxLevel}
        />
        <AbilitiesColumn
          title="Compétences"
          abilities={skills}
          customAbilities={customSkills}
          maxLevel={maxLevel}
        />
        <AbilitiesColumn
          title="Connaissances"
          abilities={knowledges}
          customAbilities={customKnowkedges}
          maxLevel={maxLevel}
        />
      </HorizontalSection>
    </>
  );
};

export default Abilities;
