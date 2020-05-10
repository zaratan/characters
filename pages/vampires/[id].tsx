import useSWR from 'swr';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { nodeFetcher, host } from '../../helpers/fetcher';
import Sheet from '../../components/Sheet';
import { VampireType } from '../api/types/VampireType';

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
  res,
}) => {
  const initialData = await nodeFetcher(
    `${host(req)}/api/vampires/${query.id}`
  );

  if (!initialData.id) {
    res.writeHead(302, {
      Location: '/vampires/new',
    });
    res.end();
    return { props: {} };
  }

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
  const { data } = useSWR<VampireType>(`/api/vampires/${id}`, {
    refreshInterval: 10 * 1000,
    initialData,
  });

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
      id={String(id)}
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
      newChar={false}
      advantages={advantages}
      flaws={flaws}
      languages={languages}
      leftOverPex={leftOverPex}
    />
  );
};

export default Home;
