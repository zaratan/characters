import React, { useContext } from 'react';
import { HorizontalSection } from '../../styles/Sections';
import { AttributeLine } from '../Line';
import { maxDot } from '../../helpers/maxLevels';
import AttributesContext from '../../contexts/AttributesContext';
import GenerationContext from '../../contexts/GenerationContext';
import ColumnTitle from '../ColumnTitle';
import { calcPexAttribute } from '../../helpers/pex';
import SectionTitle from '../SectionTitle';

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
  const generation = useContext(GenerationContext);
  const maxLevel = maxDot(generation.value);
  return (
    <>
      <SectionTitle
        title="Attributs"
        pexElems={[
          {
            elemArray: [
              strength,
              dexterity,
              stamina,
              charisma,
              manipulation,
              appearance,
              perception,
              intelligence,
              wits,
            ],
            pexCalc: calcPexAttribute,
          },
        ]}
      />
      <HorizontalSection>
        <div>
          <ColumnTitle
            elemArray={[strength, dexterity, stamina]}
            pexCalc={calcPexAttribute}
            title="Physique"
          />
          <AttributeLine title="Force" elem={strength} maxLevel={maxLevel} />
          <AttributeLine
            title="Dextrérité"
            elem={dexterity}
            maxLevel={maxLevel}
          />
          <AttributeLine title="Vigueur" elem={stamina} maxLevel={maxLevel} />
        </div>
        <div>
          <ColumnTitle
            elemArray={[charisma, manipulation, appearance]}
            pexCalc={calcPexAttribute}
            title="Social"
          />
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
          <ColumnTitle
            elemArray={[perception, intelligence, wits]}
            pexCalc={calcPexAttribute}
            title="Mental"
          />
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
