import React, { useContext } from 'react';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import { ColumnTitle } from '../styles/Titles';
import { AttributeLine } from './Line';
import { maxDot } from '../helpers/maxLevels';
import InfosContext from '../contexts/InfosContext';
import AttributesContext from '../contexts/AttributesContext';

const Attributes = () => {
  const {
    strength,
    dexterity,
    stamina,
    charisma,
    manipulation,
    appearance,
    perception,
    intelligence,
    wits,
  } = useContext(AttributesContext);
  const { generation } = useContext(InfosContext);
  const maxLevel = maxDot(generation.value);

  return (
    <>
      <StyledLine title="Attributs" />
      <HorizontalSection>
        <div>
          <ColumnTitle>Physique</ColumnTitle>
          <AttributeLine title="Force" elem={strength} maxLevel={maxLevel} />
          <AttributeLine
            title="Dextrérité"
            elem={dexterity}
            maxLevel={maxLevel}
          />
          <AttributeLine title="Vigueur" elem={stamina} maxLevel={maxLevel} />
        </div>
        <div>
          <ColumnTitle>Social</ColumnTitle>
          <AttributeLine title="Charisme" elem={charisma} maxLevel={maxLevel} />
          <AttributeLine
            title="Manipulation"
            elem={manipulation}
            maxLevel={maxLevel}
          />
          <AttributeLine
            title="Apparence"
            elem={appearance}
            maxLevel={maxLevel}
          />
        </div>
        <div>
          <ColumnTitle>Mental</ColumnTitle>
          <AttributeLine
            title="Perception"
            elem={perception}
            maxLevel={maxLevel}
          />
          <AttributeLine
            title="Intelligence"
            elem={intelligence}
            maxLevel={maxLevel}
          />
          <AttributeLine title="Astuce" elem={wits} maxLevel={maxLevel} />
        </div>
      </HorizontalSection>
    </>
  );
};

export default Attributes;
