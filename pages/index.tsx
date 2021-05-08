import Head from 'next/head';
import useSWR from 'swr';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import styled from 'styled-components';
import { useContext } from 'react';
import dynamic from 'next/dynamic';
import SheetContainer from '../styles/SheetContainer';
import { HorizontalSection } from '../styles/Sections';
import { HandLargeText } from '../styles/Texts';
import Nav from '../components/Nav';
import { fetchVampireFromDB } from './api/vampires';
import SystemContext from '../contexts/SystemContext';
import Footer from '../components/Footer';
import ActionsFooter from '../components/ActionsFooter';
import { EmptyLine } from '../styles/Lines';
import MoonIcon from '../components/icons/MoonIcon';
import SunIcon from '../components/icons/SunIcon';
import ThemeContext from '../contexts/ThemeContext';

const PusherSheetsListener = dynamic(
  () => import('../components/no-ssr/PusherSheetsListener'),
  { ssr: false }
);

const TitleContainer = styled.li`
  display: flex;
  justify-content: center;
  position: relative;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const getStaticProps: GetStaticProps = async () => {
  const initialData = await fetchVampireFromDB();

  return {
    props: {
      initialData,
    },
    revalidate: 60 * 10,
  };
};

const Home = ({
  initialData,
}: {
  initialData: { characters: Array<{ name: string; key: string }> };
}) => {
  const { needPusherFallback } = useContext(SystemContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { data, mutate } = useSWR(`/api/vampires`, {
    initialData,
    refreshInterval: needPusherFallback ? 10 * 1000 : 0,
    revalidateOnMount: true,
  });
  const { characters } = data;
  characters.sort((a, b) => (a.name < b.name ? -1 : 1));
  return (
    <MainContainer>
      <PusherSheetsListener callback={() => mutate()} />
      <Head>
        <title>Char - Feuilles de perso</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav />
      <EmptyLine />
      <EmptyLine />
      <SheetContainer>
        <HorizontalSection as="ul">
          {characters.map((character) => (
            <TitleContainer key={character.key}>
              <Link
                href="/vampires/[id]"
                passHref
                as={`/vampires/${character.key}`}
              >
                <HandLargeText as="a">
                  {character.name || 'Pasdnom'}
                </HandLargeText>
              </Link>
            </TitleContainer>
          ))}
        </HorizontalSection>
      </SheetContainer>
      <ActionsFooter
        actions={[
          {
            glyph: darkMode ? SunIcon : MoonIcon,
            name: `Mode ${darkMode ? 'Clair' : 'Sombre'}`,
            act: toggleDarkMode,
          },
        ]}
        loggedActions={[
          { name: 'Nouveau Personnage', link: '/new', glyph: '+' },
        ]}
      />
      <Footer withoutEmptyLines />
    </MainContainer>
  );
};

export default Home;
