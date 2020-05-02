import Head from 'next/head';
import styled from 'styled-components';
import useSWR from 'swr';
import Attributes from '../../components/Attributes';
import Infos from '../../components/Infos';
import Mind from '../../components/Mind';
import {
  RawAbilitiesListType,
  AbilitiesProvider,
} from '../../contexts/AbilitiesContext';
import Abilities from '../../components/Abilities';
import { InfosType, InfosProvider } from '../../contexts/InfosContext';
import {
  AttributesType,
  AttributesProvider,
} from '../../contexts/AttributesContext';
import { MindType, MindProvider } from '../../contexts/MindContext';
import {
  DisciplinesList,
  CombinedDisciplinesList,
  DisciplinesProvider,
} from '../../contexts/DisciplinesContext';
import Disciplines from '../../components/Disciplines';
import Footer from '../../components/Footer';
import { nodeFetcher } from '../../helpers/fetcher';
import defaultData from '../../contexts/defaultData';

const SheetContainer = styled.main`
  margin: auto;
  margin-top: 20px;
  width: 80%;
  max-width: 2000px;

  @media screen and (max-width: 1500px) {
    width: 95%;
  }

  @media screen and (max-width: 1304px) {
    width: 80%;
  }

  @media screen and (max-width: 1022px) {
    width: 95%;
  }

  @media screen and (max-width: 859px) {
    width: 80%;
  }

  @media screen and (max-width: 600px) {
    width: 90%;
  }
`;

const PageTitle = styled.div`
  display: flex;
  justify-content: center;
`;

const Sheet = ({
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
}) => (
  <InfosProvider infos={infos}>
    <AttributesProvider attributes={attributes}>
      <MindProvider mind={mind}>
        <AbilitiesProvider
          talents={talents}
          customTalents={customTalents}
          skills={skills}
          customSkills={customSkills}
          knowledges={knowledges}
          customKnowledges={customKnowledges}
        >
          <DisciplinesProvider
            clanDisciplines={clanDisciplines}
            outClanDisciplines={outClanDisciplines}
            combinedDisciplines={combinedDisciplines}
          >
            <SheetContainer>
              <Head>
                <title>
                  {infos.name ? `${infos.name} - ` : null}Feuille de Personnage
                </title>
                <link rel="icon" href="/favicon.ico" />
              </Head>

              <PageTitle>
                <img src="/title.png" alt="Vampire Dark Age" />
              </PageTitle>

              <Infos />
              <Attributes />
              <Abilities />
              <Mind />
              <Disciplines />
            </SheetContainer>
            <Footer />
          </DisciplinesProvider>
        </AbilitiesProvider>
      </MindProvider>
    </AttributesProvider>
  </InfosProvider>
);

const Home = () => {
  const { data } = useSWR(`/api/vampires/12`, {
    refreshInterval: 5000,
  });
  console.log({ data });
  if (!data) {
    return 'Loading to be created.';
  }
  const {
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
  } = data.vampire;
  console.log({ data, infos });
  return (
    <Sheet
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
      key="notDefault"
    />
  );
};

export default Home;
