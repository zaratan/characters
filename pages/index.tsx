import Head from 'next/head';
import useSWR from 'swr';
import Link from 'next/link';
import { GetServerSideProps, GetStaticProps } from 'next';
import styled from 'styled-components';
import { useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { nodeFetcher, host, fetcher } from '../helpers/fetcher';
import SheetContainer from '../styles/SheetContainer';
import { HorizontalSection } from '../styles/Sections';
import { HandLargeText } from '../styles/Texts';
import { ActionItem } from '../styles/Items';
import { Glyph } from '../components/Glyph';
import SectionTitle from '../components/SectionTitle';
import Nav from '../components/Nav';
import { fetchVampireFromDB } from './api/vampires';
import { subscribeToSheets } from '../helpers/pusherClient';
import SystemContext from '../contexts/SystemContext';
import Footer from '../components/Footer';
import ActionsFooter from '../components/ActionsFooter';

const PusherSheetsListener = dynamic(
  () => import('../components/no-ssr/PusherSheetsListener'),
  { ssr: false }
);

const TitleContainer = styled.li`
  display: flex;
  justify-content: center;
  position: relative;
`;

const GlyphContainer = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 2rem;
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
    unstable_revalidate: 1,
  };
};

const Home = ({
  initialData,
}: {
  initialData: { characters: Array<{ name: string; key: string }> };
}) => {
  const { needPusherFallback } = useContext(SystemContext);
  const { data, mutate } = useSWR(`/api/vampires`, {
    initialData,
    refreshInterval: needPusherFallback ? 10 * 1000 : 0,
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
      <SheetContainer>
        <HorizontalSection as="ul">
          {characters.map((character) => {
            const onClick = async () => {
              await fetcher(`/api/vampires/${character.key}/delete`, {
                method: 'POST',
              });
              mutate({
                characters: characters.filter(
                  (char) => char.key !== character.key
                ),
              });
            };
            return (
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
                {/* <GlyphContainer>
                  <Glyph name={`Remove ${character.name}`} onClick={onClick}>
                    ✘
                  </Glyph>
                </GlyphContainer> */}
              </TitleContainer>
            );
          })}
        </HorizontalSection>
      </SheetContainer>
      <ActionsFooter
        loggedActions={[
          { name: 'Nouveau Personnage', link: '/vampires/new', glyph: '+' },
        ]}
      />
      <Footer withoutEmptyLines />
    </MainContainer>
  );
};

export default Home;
