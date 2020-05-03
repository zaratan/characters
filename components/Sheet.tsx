import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import {
  AttributesType,
  AttributesProvider,
} from '../contexts/AttributesContext';
import {
  RawAbilitiesListType,
  AbilitiesProvider,
} from '../contexts/AbilitiesContext';
import { InfosType, InfosProvider } from '../contexts/InfosContext';
import { MindType, MindProvider } from '../contexts/MindContext';
import {
  DisciplinesList,
  CombinedDisciplinesList,
  DisciplinesProvider,
} from '../contexts/DisciplinesContext';
import Infos from './Infos';
import Attributes from './Attributes';
import Abilities from './Abilities';
import Mind from './Mind';
import Disciplines from './Disciplines';
import Footer from './Footer';
import { GenerationProvider } from '../contexts/GenerationContext';

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
}) => (
  <GenerationProvider generation={generation}>
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
                    {infos.name ? `${infos.name} - ` : null}Feuille de
                    Personnage
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
  </GenerationProvider>
);
export default Sheet;
