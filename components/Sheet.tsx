import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { AttributesProvider } from '../contexts/AttributesContext';
import { AbilitiesProvider } from '../contexts/AbilitiesContext';
import { InfosProvider } from '../contexts/InfosContext';
import { MindProvider } from '../contexts/MindContext';
import { DisciplinesProvider } from '../contexts/DisciplinesContext';
import Infos from './sections/Infos';
import Attributes from './sections/Attributes';
import Abilities from './sections/Abilities';
import Mind from './sections/Mind';
import Disciplines from './sections/Disciplines';
import Footer from './Footer';
import { GenerationProvider } from '../contexts/GenerationContext';
import { IdProvider } from '../contexts/IdContext';
import SheetContainer from '../styles/SheetContainer';
import { AdvFlawProvider } from '../contexts/AdvFlawContext';
import Misc from './sections/Misc';
import { LanguagesProvider } from '../contexts/LanguagesContext';
import Controls from './sections/Controls';
import { PreferencesProvider } from '../contexts/PreferencesContext';
import PexSection from './sections/PexSection';
import { PexProvider } from '../contexts/PexContext';
import { ModeProvider } from '../contexts/ModeContext';
import { VampireType } from '../types/VampireType';

const PageTitle = styled.div`
  display: flex;
  justify-content: center;
`;

const Sheet = ({
  id,
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
  newChar = false,
  advantages = [],
  flaws = [],
  languages = [],
  leftOverPex = 0,
  startEdit,
  startPlay,
}: VampireType & {
  id: string;
  newChar: boolean;
  startEdit?: boolean;
  startPlay?: boolean;
}) => (
  <PreferencesProvider>
    <IdProvider id={id}>
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
                  <AdvFlawProvider advantages={advantages} flaws={flaws}>
                    <LanguagesProvider languages={languages}>
                      <PexProvider leftOverPex={leftOverPex}>
                        <ModeProvider
                          startEdit={startEdit}
                          startPlay={startPlay}
                        >
                          <Controls newChar={newChar} />
                          <SheetContainer>
                            <Head>
                              <title>
                                {infos.name ? `${infos.name} - ` : null}
                                Feuille de Personnage
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
                            <Misc />
                            <PexSection />
                          </SheetContainer>
                        </ModeProvider>
                      </PexProvider>
                    </LanguagesProvider>
                  </AdvFlawProvider>
                  <Footer />
                </DisciplinesProvider>
              </AbilitiesProvider>
            </MindProvider>
          </AttributesProvider>
        </InfosProvider>
      </GenerationProvider>
    </IdProvider>
  </PreferencesProvider>
);
export default Sheet;
