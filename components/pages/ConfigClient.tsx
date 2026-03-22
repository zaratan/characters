'use client';
import { useContext } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import Footer from '../Footer';
import Nav from '../Nav';
import { SectionsProvider } from '../../contexts/SectionsContext';
import type { VampireType } from '../../types/VampireType';
import SystemContext from '../../contexts/SystemContext';

import MeContext from '../../contexts/MeContext';
import { AccessesProvider } from '../../contexts/AccessesContext';
import Config from '../config/Config';
import ErrorPage from '../ErrorPage';

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const MainContainer = styled.main`
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ConfigClient = ({
  initialData,
  id,
}: {
  initialData: VampireType & { id: string };
  id: string;
}) => {
  const { needPusherFallback } = useContext(SystemContext);
  const { connected, me } = useContext(MeContext);
  const { data } = useSWR<VampireType>(`/api/vampires/${id}`, {
    fallbackData: initialData,
    refreshInterval: needPusherFallback ? 10 * 1000 : 0,
    revalidateOnMount: true,
  });

  if (!connected) {
    return <ErrorPage />;
  }

  if (!me!.isAdmin && !(data!.editors || []).includes(me!.id)) {
    return (
      <OuterContainer>
        <Nav />
        <strong className="h-full grow flex justify-center items-center">
          Vous n&apos;avez pas accès à la configuration de ce personnage.
        </strong>
        <Footer />
      </OuterContainer>
    );
  }

  return (
    <OuterContainer>
      <Nav returnTo={`/vampires/${id}/config`} />
      <MainContainer>
        <SectionsProvider sections={data!.sections}>
          <AccessesProvider
            editors={data!.editors || []}
            viewers={data!.viewers || []}
            privateSheet={data!.privateSheet}
          >
            <Config id={id} name={data!.infos.name} />
          </AccessesProvider>
        </SectionsProvider>
      </MainContainer>
      <Footer />
    </OuterContainer>
  );
};

export default ConfigClient;
