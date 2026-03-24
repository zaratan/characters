import { useContext } from 'react';
import SectionTitle from '../SectionTitle';
import FaithContext from '../../contexts/FaithContext';
import { calcPexTrueFaith, calcPexDiffTrueFaith } from '../../helpers/pex';
import ColumnTitle from '../ColumnTitle';
import Line from '../line/Line';
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
        <div className="container-hover-reveal">
          <ColumnTitle
            title="Vraie Foi"
            elemArray={[trueFaith]}
            pexCalc={calcPexTrueFaith}
          />
          <Line
            elem={trueFaith}
            maxLevel={10}
            diffPexCalc={calcPexDiffTrueFaith}
            name="Vraie Foi"
            inactive={!editMode}
          />
        </div>
      </HorizontalSection>
    </>
  );
};

export default Faith;
