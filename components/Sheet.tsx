import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
import { IdProvider } from '../contexts/IdContext';
import SheetContainer from '../styles/SheetContainer';
import { ActionItem } from '../styles/Items';
import { generateHandleKeypress } from '../helpers/handlers';
import { AdvFlawProvider, AdvFlawType } from '../contexts/AdvFlawContext';
import Misc from './Misc';
import { RawLanguage, LanguagesProvider } from '../contexts/LanguagesContext';
import Controls from './Controls';

const PageTitle = styled.div`
  display: flex;
  justify-content: center;
`;

const BackLink = styled(ActionItem)`
  position: absolute;
  top: 3rem;
  background-color: white;
  border-radius: 50%;
  z-index: 2;
  height: 60px;
  width: 60px;
  font-size: 2rem;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  :active {
    box-shadow: none;
    background-color: #f7f7f7;
    top: calc(3rem + 1px);
    left: calc(1px);
  }
  @media screen and (any-hover: none) {
    display: none;
  }
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
}: {
  id: string;
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
  newChar: boolean;
}) => {
  const router = useRouter();

  return (
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
                      <SheetContainer>
                        <Head>
                          <title>
                            {infos.name ? `${infos.name} - ` : null}Feuille de
                            Personnage
                          </title>
                          <link rel="icon" href="/favicon.ico" />
                        </Head>

                        <Link href="/">
                          <BackLink
                            as="a"
                            role="button"
                            tabIndex={0}
                            aria-label="Retour"
                            onKeyPress={generateHandleKeypress(() =>
                              router.push('/')
                            )}
                          >
                            ←
                          </BackLink>
                        </Link>
                        <PageTitle>
                          <img src="/title.png" alt="Vampire Dark Age" />
                        </PageTitle>

                        <Infos />
                        <Attributes />
                        <Abilities />
                        <Mind />
                        <Disciplines />
                        <Misc />
                        <Controls newChar={newChar} />
                      </SheetContainer>
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
  );
};
export default Sheet;
