import Head from 'next/head';
import styled from 'styled-components';
import Attributes from '../components/Attributes';
import Infos from '../components/Infos';
import Mind from '../components/Mind';
import {
  RawAbilitiesListType,
  AbilitiesProvider,
} from '../contexts/AbilitiesContext';
import Abilities from '../components/Abilities';
import { InfosType, InfosProvider } from '../contexts/InfosContext';
import {
  AttributesType,
  AttributesProvider,
} from '../contexts/AttributesContext';
import { MindType, MindProvider } from '../contexts/MindContext';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getStaticProps(_context) {
  const knowledges = [
    { title: 'Érudition', value: 1 },
    { title: 'Investigation', value: 1 },
    { title: 'Droit', value: 1 },
    { title: 'Linguistique', value: 1 },
    { title: 'Médecine', value: 1 },
    { title: 'Occulte', value: 1 },
    { title: 'Sagesse pop.', value: 1 },
    { title: 'Politique', value: 1 },
    { title: 'Senechal', value: 1 },
    { title: 'Theologie', value: 1 },
  ];

  const customKnowledges = [{ title: 'Énigme', value: 1, key: 'Énigme' }];

  const skills = [
    { title: 'Animaux', value: 1 },
    { title: 'Archerie', value: 1 },
    { title: 'Artisanats', value: 1 },
    { title: 'Equitation', value: 1 },
    { title: 'Etiquette', value: 1 },
    { title: 'Furtivite', value: 0 },
    { title: 'Commerce', value: 1 },
    { title: 'Melee', value: 1 },
    { title: 'Représentation', value: 1 },
    { title: 'Survie', value: 1 },
  ];

  const customSkills = [{ title: 'Stratégie', value: 4, key: 'Stratégie' }];

  const talents = [
    { title: 'Expression', value: 1 },
    { title: 'Vigilance', value: 3 },
    { title: 'Athlétisme', value: 6 },
    { title: 'Bagare', value: 6 },
    { title: 'Conscience', value: 1 },
    { title: 'Empathie', value: 1 },
    { title: 'Intimidation', value: 1 },
    { title: 'Passe-passe', value: 1 },
    { title: 'Commandement', value: 1 },
    { title: 'Subterfuge', value: 1 },
  ];

  const customTalents = [];

  const attributes = {
    strength: 1,
    dexterity: 3,
    stamina: 6,
    charisma: 1,
    manipulation: 3,
    appearance: 6,
    perception: 1,
    intelligence: 3,
    wits: 6,
  };

  const infos = {
    name: 'Sined Nisap',
    playerName: 'Zaratan',
    generation: 6,
    nature: 'Pon',
    sire: 'None',
    demeanor: 'Test',
    haven: 'Kyoto',
    chronicle: 'Life',
    clan: 'None',
  };

  const mind = {
    willpower: 6,
    tempWillpower: 4,
    bloodSpent: 6,
    conscience: 4,
    isConviction: true,
    selfControl: 2,
    isInstinct: false,
    courage: 4,
    pathName: 'Roi (Vizir)',
    path: 6,
    isExtraBruisable: true,
    health: [3, 3, 2, 2, 1, 0, 0, 0],
  };

  return {
    props: {
      attributes,
      talents,
      customTalents,
      skills,
      customSkills,
      knowledges,
      customKnowledges,
      infos,
      mind,
    },
  };
}

const Home = ({
  attributes,
  talents,
  customTalents,
  skills,
  customSkills,
  knowledges,
  customKnowledges,
  infos,
  mind,
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
          </SheetContainer>
        </AbilitiesProvider>
      </MindProvider>
    </AttributesProvider>
  </InfosProvider>
);

export default Home;
