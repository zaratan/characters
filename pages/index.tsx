import Head from 'next/head';
import useSWR from 'swr';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import { nodeFetcher, host, fetcher } from '../helpers/fetcher';
import SheetContainer from '../styles/SheetContainer';
import { HorizontalSection } from '../styles/Sections';
import { HandLargeText } from '../styles/Texts';
import { ActionItem } from '../styles/Items';
import { Glyph } from '../components/Glyph';
import SectionTitle from '../components/SectionTitle';
import Nav from '../components/Nav';

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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const initialData = await nodeFetcher(`${host(req)}/api/vampires`);

  return {
    props: {
      initialData,
    },
  };
};

const Home = ({
  initialData,
}: {
  initialData: { characters: Array<{ name: string; key: string }> };
}) => {
  const { data, mutate } = useSWR(`/api/vampires`, {
    refreshInterval: 10 * 1000,
    initialData,
  });
  const { characters } = data;
  characters.sort((a, b) => (a.name < b.name ? -1 : 1));
  return (
    <>
      <Head>
        <title>Char - Feuilles de perso</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Nav actions={[{ text: 'Nouveau personnage', link: '/vampires/new' }]} />
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
    </>
  );
};

export default Home;
