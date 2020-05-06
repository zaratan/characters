import { GetStaticProps } from 'next';
import { v4 as uuid } from 'uuid';
import { RawAbilitiesListType } from '../../contexts/AbilitiesContext';
import { InfosType } from '../../contexts/InfosContext';
import { AttributesType } from '../../contexts/AttributesContext';
import { MindType } from '../../contexts/MindContext';
import {
  DisciplinesList,
  CombinedDisciplinesList,
} from '../../contexts/DisciplinesContext';
import Sheet from '../../components/Sheet';
import defaultData from '../../contexts/defaultData';
import { AdvFlawType } from '../../contexts/AdvFlawContext';
import { RawLanguage } from '../../contexts/LanguagesContext';

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    data: defaultData,
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Home = ({ data }: { data: any }) => {
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
  }: {
    generation: number;
    attributes: AttributesType;
    talents: RawAbilitiesListType;
    customTalents: RawAbilitiesListType;
    skills: RawAbilitiesListType;
    customSkills: RawAbilitiesListType;
    knowledges: RawAbilitiesListType;
    customKnowledges: RawAbilitiesListType;
    infos: InfosType;
    mind: MindType;
    clanDisciplines: DisciplinesList;
    outClanDisciplines: DisciplinesList;
    combinedDisciplines: CombinedDisciplinesList;
    advantages: Array<AdvFlawType>;
    flaws: Array<AdvFlawType>;
    languages: Array<RawLanguage>;
    leftOverPex: number;
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
    />
  );
};

export default Home;
