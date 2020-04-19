import React from 'react';
import { StyledLine } from '../styles/Lines';
import { ColumnTitle } from '../styles/Titles';
import { AbilityLine } from './Line';
import { HorizontalSection } from '../styles/Sections';

export type AbilitiesListType = Array<{ title: string; value: number }>;

const AbilitiesColumn = ({
  abilities,
  title,
}: {
  abilities: AbilitiesListType;
  title: string;
}) => (
  <div>
    <ColumnTitle>{title}</ColumnTitle>
    {abilities.map(ability => (
      <AbilityLine title={ability.title} value={ability.value} />
    ))}
  </div>
);

const Abilities = ({
  talents,
  skills,
  knowledges,
}: {
  talents: AbilitiesListType;
  skills: AbilitiesListType;
  knowledges: AbilitiesListType;
}) => (
  <>
    <StyledLine title="Capacités" />
    <HorizontalSection>
      <AbilitiesColumn title="Talents" abilities={talents} />
      <AbilitiesColumn title="Compétences" abilities={skills} />
      <AbilitiesColumn title="Connaissances" abilities={knowledges} />
    </HorizontalSection>
  </>
);

export default Abilities;
