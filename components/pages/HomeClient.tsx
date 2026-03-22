'use client';

import useSWR from 'swr';
import Link from 'next/link';
import styled from 'styled-components';
import { useContext } from 'react';
import dynamic from 'next/dynamic';

import { HorizontalSection } from '../../styles/Sections';
import { HandLargeText } from '../../styles/Texts';
import Nav from '../Nav';
import SystemContext from '../../contexts/SystemContext';
import Footer from '../Footer';
import ActionsFooter from '../ActionsFooter';
import { EmptyLine } from '../../styles/Lines';
import MoonIcon from '../icons/MoonIcon';
import SunIcon from '../icons/SunIcon';
import ThemeContext from '../../contexts/ThemeContext';
import PlusIcon from '../icons/PlusIcon';

const PusherSheetsListener = dynamic(
  () => import('../no-ssr/PusherSheetsListener'),
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

type HomeClientProps = {
  initialData: {
    characters: Array<{ name: string; key: string }>;
    failed: boolean;
  };
};

const HomeClient = ({ initialData }: HomeClientProps) => {
  const { needPusherFallback } = useContext(SystemContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { data, mutate } = useSWR(`/api/vampires`, {
    fallbackData: initialData,
    refreshInterval: needPusherFallback ? 10 * 1000 : 0,
    revalidateOnMount: true,
  });
  const characters = data?.characters ?? [];
  characters.sort((a, b) => (a.name < b.name ? -1 : 1));
  return (
    <MainContainer>
      <PusherSheetsListener callback={() => mutate()} />
      <Nav />
      <EmptyLine />
      <EmptyLine />
      <main className="w-4/5 max-4xl:w-[95%] max-3xl:w-4/5 max-2xl:w-[95%] max-xl:w-4/5 max-md-plus:w-[90%] mx-auto mt-5 grow max-w-[2000px] relative">
        <HorizontalSection as="ul">
          {characters.map((character) => (
            <TitleContainer key={character.key}>
              <Link href={`/vampires/${character.key}`}>
                <HandLargeText>{character.name || 'Pasdnom'}</HandLargeText>
              </Link>
            </TitleContainer>
          ))}
        </HorizontalSection>
      </main>
      <ActionsFooter
        actions={[
          {
            glyph: darkMode ? SunIcon : MoonIcon,
            name: `Mode ${darkMode ? 'Clair' : 'Sombre'}`,
            act: toggleDarkMode,
          },
        ]}
        loggedActions={[
          { name: 'Nouveau Personnage', link: '/new', glyph: PlusIcon },
        ]}
      />
      <Footer withoutEmptyLines />
    </MainContainer>
  );
};

export default HomeClient;
