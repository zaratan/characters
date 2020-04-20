import React from 'react';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import { ColumnTitle } from '../styles/Titles';
import { AttributeLine } from './Line';
import { maxDot } from '../helpers/maxLevels';

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
  generation = 12,
}: { generation?: number } & AttributesType) => {
  const maxLevel = maxDot(generation);
  return (
    <>
      <StyledLine title="Attributs" />
      <HorizontalSection>
        <div>
          <ColumnTitle>Physique</ColumnTitle>
          <AttributeLine title="Force" value={strength} maxLevel={maxLevel} />
          <AttributeLine
            title="Dextrérité"
            value={dexterity}
            maxLevel={maxLevel}
          />
          <AttributeLine title="Vigueur" value={stamina} maxLevel={maxLevel} />
        </div>
        <div>
          <ColumnTitle>Social</ColumnTitle>
          <AttributeLine
            title="Charisme"
            value={charisma}
            maxLevel={maxLevel}
          />
          <AttributeLine
            title="Manipulation"
            value={manipulation}
            maxLevel={maxLevel}
          />
          <AttributeLine
            title="Apparence"
            value={appearance}
            maxLevel={maxLevel}
          />
        </div>
        <div>
          <ColumnTitle>Mental</ColumnTitle>
          <AttributeLine
            title="Perception"
            value={perception}
            maxLevel={maxLevel}
          />
          <AttributeLine
            title="Intelligence"
            value={intelligence}
            maxLevel={maxLevel}
          />
          <AttributeLine title="Astuce" value={wits} maxLevel={maxLevel} />
        </div>
      </HorizontalSection>
    </>
  );
};

export default Attributes;
