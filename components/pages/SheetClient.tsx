'use client';

import useSWR from 'swr';
import { useContext } from 'react';
import dynamic from 'next/dynamic';
import Sheet from '../Sheet';
import type { VampireType } from '../../types/VampireType';
import SystemContext from '../../contexts/SystemContext';
import MeContext from '../../contexts/MeContext';
import { DataProvider } from '../../contexts/DataContext';
import ErrorPage from '../ErrorPage';

const PusherSheetListener = dynamic(
  () => import('../no-ssr/PusherSheetListener'),
  { ssr: false }
);

type Props = {
  initialData: VampireType & { id: string };
  id: string;
};

const SheetClient = ({ initialData, id }: Props) => {
  const { needPusherFallback } = useContext(SystemContext);
  const { connected, me } = useContext(MeContext);
  const { data, mutate } = useSWR<VampireType>(`/api/vampires/${id}`, {
    fallbackData: initialData,
    refreshInterval: needPusherFallback ? 10 * 1000 : 0,
    revalidateOnMount: true,
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
    sections = {
      blood: true,
      disciplines: true,
      generation: true,
      path: true,
      vampireInfos: true,
      trueFaith: false,
      humanMagic: false,
    },
    trueFaith = 0,
    humanMagic = {
      psy: [],
      theurgy: [],
      staticMagic: [],
    },
    editors = [],
    viewers = [],
    privateSheet = false,
  } = data!;

  if (
    privateSheet &&
    !(
      connected &&
      (me!.isAdmin || editors.includes(me!.id) || viewers.includes(me!.id))
    )
  ) {
    return <ErrorPage />;
  }

  // default era
  const safeInfos = infos.era === undefined ? { ...infos, era: 0 } : infos;

  return (
    <DataProvider>
      <PusherSheetListener id={id} callback={mutate} />
      <Sheet
        id={id}
        generation={generation}
        infos={safeInfos}
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
        advantages={advantages}
        flaws={flaws}
        languages={languages}
        leftOverPex={leftOverPex}
        sections={sections}
        trueFaith={trueFaith}
        humanMagic={humanMagic}
        editors={editors}
        viewers={viewers}
        privateSheet={privateSheet}
      />
    </DataProvider>
  );
};

export default SheetClient;
