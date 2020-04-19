import React from 'react';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import { ColumnTitle } from '../styles/Titles';
import { AttributeLine } from './Line';

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

const Attributes = ({
  strength,
  dexterity,
  stamina,
  charisma,
  manipulation,
  appearance,
  perception,
  intelligence,
  wits,
}: AttributesType) => (
  <>
    <StyledLine title="Attributs" />
    <HorizontalSection>
      <div>
        <ColumnTitle>Physique</ColumnTitle>
        <AttributeLine title="Force" value={strength} />
        <AttributeLine title="Dextrérité" value={dexterity} />
        <AttributeLine title="Vigueur" value={stamina} />
      </div>
      <div>
        <ColumnTitle>Social</ColumnTitle>
        <AttributeLine title="Charisme" value={charisma} />
        <AttributeLine title="Manipulation" value={manipulation} />
        <AttributeLine title="Apparence" value={appearance} />
      </div>
      <div>
        <ColumnTitle>Mental</ColumnTitle>
        <AttributeLine title="Perception" value={perception} />
        <AttributeLine title="Intelligence" value={intelligence} />
        <AttributeLine title="Astuce" value={wits} />
      </div>
    </HorizontalSection>
  </>
);

export default Attributes;
