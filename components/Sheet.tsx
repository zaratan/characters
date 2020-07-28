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
import { PreferencesProvider } from '../contexts/PreferencesContext';
import PexSection from './sections/PexSection';
import { PexProvider } from '../contexts/PexContext';
import { ModeProvider } from '../contexts/ModeContext';
import { VampireType } from '../types/VampireType';
import SheetActionsFooter from './SheetActionsFooter';
import Nav from './Nav';
import { Title } from '../styles/Titles';
import { SectionsProvider } from '../contexts/SectionsContext';
import { FaithProvider } from '../contexts/FaithContext';
import Faith from './sections/Faith';
import { HumanMagicProvider } from '../contexts/HumanMagicContext';
import HumanMagic from './sections/HumanMagic';

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
  sections = {
    blood: true,
    path: true,
    disciplines: true,
    generation: true,
    vampireInfos: true,
    trueFaith: false,
    humanMagic: false,
  },
  trueFaith = 0,
  humanMagic: { psy } = { psy: [] },
  startEdit,
  startPlay,
}: VampireType & {
  id: string;
  newChar: boolean;
  startEdit?: boolean;
  startPlay?: boolean;
}) => (
  <PreferencesProvider>
    <SectionsProvider sections={sections}>
      <ModeProvider startEdit={startEdit} startPlay={startPlay}>
        <IdProvider id={id}>
          <GenerationProvider generation={generation}>
            <InfosProvider infos={infos}>
              <AttributesProvider attributes={attributes}>
                <MindProvider mind={mind}>
                  <FaithProvider trueFaith={trueFaith}>
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
                        <HumanMagicProvider psy={psy}>
                          <AdvFlawProvider
                            advantages={advantages}
                            flaws={flaws}
                          >
                            <LanguagesProvider languages={languages}>
                              <PexProvider leftOverPex={leftOverPex}>
                                <Nav />
                                <SheetContainer>
                                  <Head>
                                    <title>
                                      {infos.name ? `${infos.name} - ` : null}
                                      Feuille de Personnage
                                    </title>
                                    <link rel="icon" href="/favicon.ico" />
                                  </Head>

                                  <PageTitle>
                                    {infos.era === 0 ? (
                                      <img
                                        src="/title.png"
                                        alt="Vampire Dark Age"
                                      />
                                    ) : (
                                      <Title className="victorian-queen">
                                        Vampire Ère Victorienne
                                      </Title>
                                    )}
                                  </PageTitle>

                                  <Infos />
                                  <Attributes />
                                  <Abilities />
                                  <Mind />
                                  <Faith />
                                  <Disciplines />
                                  <HumanMagic />
                                  <Misc />
                                  <PexSection />
                                </SheetContainer>
                                <SheetActionsFooter newChar={newChar} />
                                <Footer />
                              </PexProvider>
                            </LanguagesProvider>
                          </AdvFlawProvider>
                        </HumanMagicProvider>
                      </DisciplinesProvider>
                    </AbilitiesProvider>
                  </FaithProvider>
                </MindProvider>
              </AttributesProvider>
            </InfosProvider>
          </GenerationProvider>
        </IdProvider>
      </ModeProvider>
    </SectionsProvider>
  </PreferencesProvider>
);
export default Sheet;
