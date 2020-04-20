import Head from 'next/head';
import styled from 'styled-components';
import Abilities, { AbilitiesListType } from '../components/Abilities';
import Attributes, { AttributesType } from '../components/Attributes';
import Infos, { InfosType } from '../components/Infos';

const SheetContainer = styled.main`
  margin: auto;
  margin-top: 20px;
  width: 80%;

  @media screen and (max-width: 1500px) {
    width: 95%;
  }

  @media screen and (max-width: 1260px) {
    width: 80%;
  }

  @media screen and (max-width: 1000px) {
    width: 95%;
  }

  @media screen and (max-width: 840px) {
    width: 80%;
  }

  @media screen and (max-width: 600px) {
    width: 90%;
  }

  @media screen and (max-width: 500px) {
    width: 96%;
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
  const skills = [
    { title: 'Animaux', value: 1 },
    { title: 'Archerie', value: 1 },
    { title: 'Artisanats', value: 1 },
    { title: 'Equitation', value: 1 },
    { title: 'Etiquette', value: 1 },
    { title: 'Furtivite', value: 1 },
    { title: 'Commerce', value: 1 },
    { title: 'Melee', value: 1 },
    { title: 'Représentation', value: 1 },
    { title: 'Survie', value: 1 },
  ];
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
    generation: 15,
    nature: 'Pon',
    sire: 'None',
    demeanor: 'Test',
    haven: 'Kyoto',
    chronicle: 'Life',
    clan: 'None',
  };

  return {
    props: { attributes, talents, skills, knowledges, infos },
  };
}

const Home = ({
  attributes,
  talents,
  skills,
  knowledges,
  infos,
}: {
  attributes: AttributesType;
  talents: AbilitiesListType;
  skills: AbilitiesListType;
  knowledges: AbilitiesListType;
  infos: InfosType;
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
    />
    <Abilities skills={skills} talents={talents} knowledges={knowledges} />
  </SheetContainer>
);

export default Home;
