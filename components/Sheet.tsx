import { useContext, useEffect } from 'react';
import Image from 'next/image';
import useBeforeUnload from '../hooks/useBeforeUnload';
import { AttributesProvider } from '../contexts/AttributesContext';
import { AbilitiesProvider } from '../contexts/AbilitiesContext';
import type { InfosType } from '../contexts/InfosContext';
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

import { AdvFlawProvider } from '../contexts/AdvFlawContext';
import Misc from './sections/Misc';
import { LanguagesProvider } from '../contexts/LanguagesContext';
import { PreferencesProvider } from '../contexts/PreferencesContext';
import PexSection from './sections/PexSection';
import { PexProvider } from '../contexts/PexContext';
import { ModeProvider } from '../contexts/ModeContext';
import type { VampireType } from '../types/VampireType';
import SheetActionsFooter from './SheetActionsFooter';
import Nav from './Nav';
import { Title } from '../styles/Titles';
import { SectionsProvider } from '../contexts/SectionsContext';
import { FaithProvider } from '../contexts/FaithContext';
import Faith from './sections/Faith';
import { HumanMagicProvider } from '../contexts/HumanMagicContext';
import HumanMagic from './sections/HumanMagic';
import ModificationsContext, {
  ModificationsProvider,
} from '../contexts/ModificationsContext';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';
import { useSave } from '../hooks/useSave';
import { AccessesProvider } from '../contexts/AccessesContext';
import ThemeContext from '../contexts/ThemeContext';

const UnsavedChangeCloseText =
  'Il y a des changements sur la page, êtes vous sur de vouloir la quitter sans sauvegarder ?';

const Sheet = ({ infos }: { infos: InfosType }) => {
  const { unsavedChanges, rollback } = useContext(ModificationsContext);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    document.title = infos.name
      ? `${infos.name} - Feuille de Personnage`
      : 'Feuille de Personnage';
  }, [infos.name]);

  const saveAction = useSave();
  useKeyboardShortcut('mod + z', (e) => {
    e?.preventDefault();
    rollback();
  });
  useKeyboardShortcut('mod + s', (e) => {
    e?.preventDefault();
    saveAction();
  });
  useBeforeUnload(unsavedChanges, UnsavedChangeCloseText);
  return (
    <>
      <Nav
        confirmNavigation={unsavedChanges}
        confirmText={UnsavedChangeCloseText}
      />
      <main className="w-4/5 max-4xl:w-[95%] max-3xl:w-4/5 max-2xl:w-[95%] max-xl:w-4/5 max-md-plus:w-[90%] mx-auto mt-5 h-auto max-w-[2000px] relative">
        <div className="flex justify-center">
          {infos.era === 0 ? (
            <Image
              src={darkMode ? '/title_dark.png' : '/title.png'}
              alt="Vampire Dark Age"
              width={516}
              height={160}
              priority
            />
          ) : (
            <Title className="victorian-queen">Vampire Ère Victorienne</Title>
          )}
        </div>

        <Infos />
        <Attributes />
        <Abilities />
        <Mind />
        <Faith />
        <Disciplines />
        <HumanMagic />
        <Misc />
        <PexSection />
      </main>
      <SheetActionsFooter />
      <Footer />
    </>
  );
};

const SheetWrapper = ({
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
  humanMagic: { psy, staticMagic, theurgy } = {
    psy: [],
    staticMagic: [],
    theurgy: [],
  },
  editors,
  viewers,
  privateSheet,
}: VampireType & {
  id: string;
}) => (
  <ModificationsProvider>
    <PreferencesProvider>
      <AccessesProvider
        editors={editors}
        viewers={viewers}
        privateSheet={privateSheet}
      >
        <SectionsProvider sections={sections}>
          <ModeProvider>
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
                            <HumanMagicProvider
                              psy={psy}
                              staticMagic={staticMagic}
                              theurgy={theurgy}
                            >
                              <AdvFlawProvider
                                advantages={advantages}
                                flaws={flaws}
                              >
                                <LanguagesProvider languages={languages}>
                                  <PexProvider leftOverPex={leftOverPex}>
                                    <Sheet infos={infos} />
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
      </AccessesProvider>
    </PreferencesProvider>
  </ModificationsProvider>
);
export default SheetWrapper;
