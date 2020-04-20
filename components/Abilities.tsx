import React from 'react';
import { StyledLine } from '../styles/Lines';
import { ColumnTitle } from '../styles/Titles';
import { AbilityLine } from './Line';
import { HorizontalSection } from '../styles/Sections';
import { maxDot } from '../helpers/maxLevels';

export type AbilitiesListType = Array<{ title: string; value: number }>;

const AbilitiesColumn = ({
  abilities,
  title,
  maxLevel,
}: {
  abilities: AbilitiesListType;
  title: string;
  maxLevel: number;
}) => (
  <div>
    <ColumnTitle>{title}</ColumnTitle>
    {abilities.map(ability => (
      <AbilityLine
        title={ability.title}
        value={ability.value}
        maxLevel={maxLevel}
      />
    ))}
  </div>
);

const Abilities = ({
  talents,
  skills,
  knowledges,
  generation = 12,
}: {
  talents: AbilitiesListType;
  skills: AbilitiesListType;
  knowledges: AbilitiesListType;
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
          maxLevel={maxLevel}
        />
        <AbilitiesColumn
          title="Compétences"
          abilities={skills}
          maxLevel={maxLevel}
        />
        <AbilitiesColumn
          title="Connaissances"
          abilities={knowledges}
          maxLevel={maxLevel}
        />
      </HorizontalSection>
    </>
  );
};

export default Abilities;
