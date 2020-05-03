import useSWR from 'swr';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { RawAbilitiesListType } from '../../contexts/AbilitiesContext';
import { InfosType } from '../../contexts/InfosContext';
import { AttributesType } from '../../contexts/AttributesContext';
import { MindType } from '../../contexts/MindContext';
import {
  DisciplinesList,
  CombinedDisciplinesList,
} from '../../contexts/DisciplinesContext';
import { nodeFetcher, host } from '../../helpers/fetcher';
import Sheet from '../../components/Sheet';

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const initialData = await nodeFetcher(
    `${host(req)}/api/vampires/${query.id}`
  );

  return {
    props: {
      initialData,
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Home = ({ initialData }: { initialData: any }) => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useSWR(`/api/vampires/${id}`, {
    refreshInterval: 10 * 1000,
    initialData,
  });
  console.log({ data, infos: data.infos, id });

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
  } = data;
  return (
    <Sheet
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
    />
  );
};

export default Home;
