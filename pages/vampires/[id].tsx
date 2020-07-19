import useSWR from 'swr';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import Sheet from '../../components/Sheet';
import { VampireType } from '../../types/VampireType';
import { fetchVampireFromDB } from '../api/vampires';
import { fetchOneVampire } from '../api/vampires/[id]';
import SystemContext from '../../contexts/SystemContext';
import MeContext from '../../contexts/MeContext';

export async function getStaticPaths() {
  const vampires = await fetchVampireFromDB();
  if (vampires.failed) {
    return { paths: [], fallback: true };
  }

  return {
    paths: vampires.characters.map((vampire) => ({
      params: { id: vampire.key },
    })),
    fallback: true,
  };
}

const PusherSheetListener = dynamic(
  () => import('../../components/no-ssr/PusherSheetListener'),
  { ssr: false }
);

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const fetchedData = await fetchOneVampire(String(params.id));
  if (fetchedData.failed) {
    return {
      props: {
        notFound: true,
      },
      unstable_revalidate: 1,
    };
  }
  const initialData: VampireType & { id: string } = fetchedData.data;

  return {
    props: {
      initialData,
      notFound: false,
    },
    unstable_revalidate: 1,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Home = ({
  initialData,
  notFound,
}:
  | {
      initialData: VampireType;
      notFound: false;
    }
  | { notFound: true; initialData: undefined }) => {
  const router = useRouter();
  const { id } = router.query;
  const { needPusherFallback } = useContext(SystemContext);
  const { connected } = useContext(MeContext);
  const { data, mutate } = useSWR<VampireType>(`/api/vampires/${id}`, {
    initialData,
    refreshInterval: needPusherFallback ? 10 * 1000 : 0,
  });
  useEffect(() => {
    if (!router.isFallback && notFound) {
      router.push('/vampires/new');
    }
  });
  if (router.isFallback || notFound) {
    return <div>Loading...</div>;
  }

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
    <>
      <PusherSheetListener
        id={String(id)}
        callback={() => {
          mutate();
        }}
      />
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
    </>
  );
};

export default Home;
