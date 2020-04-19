import Head from 'next/head';
import styled from 'styled-components';
import { AttributeLine, CapacityLine } from '../components/Line';

const Title = styled.h1`
  font-family: CloisterBlack;
`;

const HorizontalSection = styled.div<{ count?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.count || 3}, auto);
  column-gap: 50px;

  @media screen and (max-width: 1260px) {
    grid-template-columns: repeat(min(${props => props.count || 2}, 2), auto);
  }

  @media screen and (max-width: 840px) {
    grid-template-columns: auto;
  }
`;

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

const EmptyLine = styled.div`
  height: 3rem;
  display: flex;
  align-items: center;
  width: 100%;
`;

const BlackLine = styled.div`
  background-color: black;
  height: 0.3rem;
  width: 100%;
`;

const SectionTitle = styled(Title)`
  padding: 0 1rem;
`;

const ColumnTitle = styled(Title)`
  text-align: center;
`;

const StyledLine = ({ title }: { title?: string }) => (
  <EmptyLine>
    <BlackLine />
    {title ? <SectionTitle>{title}</SectionTitle> : null}
    <BlackLine />
  </EmptyLine>
);

const Home: React.FC = () => (
  <SheetContainer>
    <Head>
      <title>Feuille de Personnage</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <PageTitle>
      <img src="/title.png" alt="Vampire Dark Age" />
    </PageTitle>

    <EmptyLine />

    <HorizontalSection>
      <Title>Nom:</Title>
      <Title>Joueur:</Title>
      <Title>Chronique:</Title>
      <Title>Nature:</Title>
      <Title>Attitude:</Title>
      <Title>Clan:</Title>
      <Title>Génération:</Title>
      <Title>Refuge:</Title>
      <Title>Concept:</Title>
    </HorizontalSection>

    <StyledLine title="Attributs" />
    <HorizontalSection>
      <div>
        <ColumnTitle>Physique</ColumnTitle>
        <AttributeLine title="Force" value={1} />
        <AttributeLine title="Dextrérité" value={3} />
        <AttributeLine title="Vigueur" value={6} />
      </div>
      <div>
        <ColumnTitle>Social</ColumnTitle>
        <AttributeLine title="Charisme" value={1} />
        <AttributeLine title="Manipulation" value={3} />
        <AttributeLine title="Apparence" value={6} />
      </div>
      <div>
        <ColumnTitle>Mental</ColumnTitle>
        <AttributeLine title="Perception" value={1} />
        <AttributeLine title="Intelligence" value={3} />
        <AttributeLine title="Astuce" value={6} />
      </div>
    </HorizontalSection>
    <StyledLine title="Capacités" />
    <HorizontalSection>
      <div>
        <ColumnTitle>Talents</ColumnTitle>
        <CapacityLine title="Expression" value={1} />
        <CapacityLine title="Vigilance" value={3} />
        <CapacityLine title="Athlétisme" value={6} />
        <CapacityLine title="Bagare" value={6} />
        <CapacityLine title="Conscience" value={1} />
        <CapacityLine title="Empathie" value={1} />
        <CapacityLine title="Intimidation" value={1} />
        <CapacityLine title="Passe-passe" value={1} />
        <CapacityLine title="Commandement" value={1} />
        <CapacityLine title="Subterfuge" value={1} />
      </div>
      <div>
        <ColumnTitle>Compétences</ColumnTitle>
        <CapacityLine title="Animaux" value={1} />
        <CapacityLine title="Archerie" value={1} />
        <CapacityLine title="Artisanats" value={1} />
        <CapacityLine title="Equitation" value={1} />
        <CapacityLine title="Etiquette" value={1} />
        <CapacityLine title="Furtivite" value={1} />
        <CapacityLine title="Commerce" value={1} />
        <CapacityLine title="Melee" value={1} />
        <CapacityLine title="Représentation" value={1} />
        <CapacityLine title="Survie" value={1} />
      </div>
      <div>
        <ColumnTitle>Connaissances</ColumnTitle>
        <CapacityLine title="Érudition" value={1} />
        <CapacityLine title="Investigation" value={1} />
        <CapacityLine title="Droit" value={1} />
        <CapacityLine title="Linguistique" value={1} />
        <CapacityLine title="Médecine" value={1} />
        <CapacityLine title="Occulte" value={1} />
        <CapacityLine title="Sagesse pop." value={1} />
        <CapacityLine title="Politique" value={1} />
        <CapacityLine title="Senechal" value={1} />
        <CapacityLine title="Theologie" value={1} />
      </div>
    </HorizontalSection>
  </SheetContainer>
);

export default Home;
