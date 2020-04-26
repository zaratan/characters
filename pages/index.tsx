import Head from 'next/head';
import styled from 'styled-components';
import Abilities, {
  AbilitiesListType,
  CustomAbilitiesListType,
} from '../components/Abilities';
import Attributes, { AttributesType } from '../components/Attributes';
import Infos, { InfosType } from '../components/Infos';
import Mind, { MindType } from '../components/Mind';

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
    selfControl: 2,
    courage: 4,
    pathName: 'Roi (Vizir)',
    path: 6,
    extraBruised: 3,
    bruised: 3,
    hurt: 2,
    injured: 2,
    wounded: 1,
    mauled: 0,
    crippled: 0,
    incapacitated: 0,
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
  talents: AbilitiesListType;
  customTalents: CustomAbilitiesListType;
  skills: AbilitiesListType;
  customSkills: CustomAbilitiesListType;
  knowledges: AbilitiesListType;
  customKnowledges: CustomAbilitiesListType;
  infos: InfosType;
  mind: MindType;
}) => (
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

    <Infos
      name={infos.name}
      playerName={infos.playerName}
      chronicle={infos.chronicle}
      nature={infos.nature}
      demeanor={infos.demeanor}
      clan={infos.clan}
      generation={infos.generation}
      haven={infos.haven}
      sire={infos.sire}
    />

    <Attributes
      strength={attributes.strength}
      dexterity={attributes.dexterity}
      stamina={attributes.stamina}
      charisma={attributes.charisma}
      manipulation={attributes.manipulation}
      appearance={attributes.appearance}
      perception={attributes.perception}
      intelligence={attributes.intelligence}
      wits={attributes.wits}
      generation={infos.generation}
    />
    <Abilities
      skills={skills}
      talents={talents}
      knowledges={knowledges}
      generation={infos.generation}
      customKnowkedges={customKnowledges}
      customSkills={customSkills}
      customTalents={customTalents}
    />
    <Mind
      willpower={mind.willpower}
      tempWillpower={mind.tempWillpower}
      bloodSpent={mind.bloodSpent}
      conscience={mind.conscience}
      selfControl={mind.selfControl}
      courage={mind.courage}
      pathName={mind.pathName}
      path={mind.path}
      extraBruised={mind.extraBruised}
      bruised={mind.bruised}
      hurt={mind.hurt}
      injured={mind.injured}
      wounded={mind.wounded}
      mauled={mind.mauled}
      crippled={mind.crippled}
      incapacitated={mind.incapacitated}
      generation={infos.generation}
    />
  </SheetContainer>
);

export default Home;
