import React, { useContext } from 'react';
import SectionTitle from '../SectionTitle';
import FaithContext from '../../contexts/FaithContext';
import { calcPexTrueFaith, clacPexDiffTrueFaith } from '../../helpers/pex';
import { Container } from '../../styles/Container';
import ColumnTitle from '../ColumnTitle';
import Line from '../Line';
import ModeContext from '../../contexts/ModeContext';
import { HorizontalSection } from '../../styles/Sections';
import SectionsContext from '../../contexts/SectionsContext';

const Faith = () => {
  const { useTrueFaith } = useContext(SectionsContext);
  const { trueFaith } = useContext(FaithContext);
  const { editMode } = useContext(ModeContext);
  if (!useTrueFaith) return null;
  return (
    <>
      <SectionTitle
        title="Foi"
        pexElems={[{ elemArray: [trueFaith], pexCalc: calcPexTrueFaith }]}
      />
      <HorizontalSection>
        <Container>
          <ColumnTitle
            title="Vraie Foi"
            elemArray={[trueFaith]}
            pexCalc={calcPexTrueFaith}
          />
          <Line
            elem={trueFaith}
            maxLevel={10}
            diffPexCalc={clacPexDiffTrueFaith}
            name="Vraie Foi"
            inactive={!editMode}
          />
        </Container>
      </HorizontalSection>
    </>
  );
};

export default Faith;
