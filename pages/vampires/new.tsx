import { GetStaticProps } from 'next';
import { v4 as uuid } from 'uuid';
import Sheet from '../../components/Sheet';
import defaultData from '../../contexts/defaultData';
import { VampireType } from '../../types/VampireType';

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    data: defaultData,
  },
});

const Home = ({ data }: { data: VampireType }) => {
  const {
    generation,
    infos,
    attributes,
    talents,
    customTalents,
    skills,
    customSkills,
    knowledges,
    customKnowledges,
    mind,
    clanDisciplines,
    outClanDisciplines,
    combinedDisciplines,
    advantages = [],
    flaws = [],
    languages = [],
    leftOverPex = 0,
  } = data;
  return (
    <Sheet
      id={uuid()}
      generation={generation}
      infos={infos}
      attributes={attributes}
      talents={talents}
      customTalents={customTalents}
      skills={skills}
      customSkills={customSkills}
      knowledges={knowledges}
      customKnowledges={customKnowledges}
      mind={mind}
      clanDisciplines={clanDisciplines}
      outClanDisciplines={outClanDisciplines}
      combinedDisciplines={combinedDisciplines}
      newChar
      advantages={advantages}
      flaws={flaws}
      languages={languages}
      leftOverPex={leftOverPex}
      startEdit
      startPlay={false}
    />
  );
};

export default Home;
