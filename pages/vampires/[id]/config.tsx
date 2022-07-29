import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { GetStaticProps } from 'next';
import useSWR from 'swr';
import Footer from '../../../components/Footer';
import Nav from '../../../components/Nav';
import { SectionsProvider } from '../../../contexts/SectionsContext';
import { fetchOneVampire } from '../../api/vampires/[id]';
import { VampireType } from '../../../types/VampireType';
import { fetchVampireFromDB } from '../../api/vampires';
import SystemContext from '../../../contexts/SystemContext';
import { TextFallback } from '../../new';
import MeContext from '../../../contexts/MeContext';
import { AccessesProvider } from '../../../contexts/AccessesContext';
import Config from '../../../components/config/Config';
import ErrorPage from '../../../components/ErrorPage';

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

export async function getStaticPaths() {
  const vampires = await fetchVampireFromDB();
  if (vampires.failed) {
    return { paths: [], fallback: true };
  }

  return {
    paths: vampires.characters.map((vampire) => ({
      params: { id: vampire.key },
    })),
    fallback: true,
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const fetchedData = await fetchOneVampire(String(params.id));
  if (fetchedData.failed) {
    return {
      props: {
        notFound: true,
      },
      revalidate: 1,
    };
  }
  const initialData: VampireType & { id: string } = fetchedData.data;

  return {
    props: {
      initialData,
      notFound: false,
    },
    revalidate: 1,
  };
};

const ConfigWrapper = ({
  initialData,
  notFound,
}:
  | {
      initialData: VampireType;
      notFound: false;
    }
  | { notFound: true; initialData: undefined }) => {
  const router = useRouter();
  const { id } = router.query;
  const { needPusherFallback } = useContext(SystemContext);
  const { connected, me } = useContext(MeContext);
  const { data } = useSWR<VampireType>(`/api/vampires/${id}`, {
    fallbackData: initialData,
    refreshInterval: needPusherFallback ? 10 * 1000 : 0,
    revalidateOnMount: true,
  });
  useEffect(() => {
    if (!router.isFallback && notFound) {
      router.push('/new');
    }
  });
  if (router.isFallback || notFound) {
    return <div>Loading...</div>;
  }

  if (!connected) {
    return <ErrorPage />;
  }

  if (!(data.editors || ['github|3338913']).includes(me.sub)) {
    return (
      <OuterContainer>
        <Nav />
        <TextFallback>
          Vous n&apos;avez pas accès à la configuration de ce personnage.
        </TextFallback>
        <Footer />
      </OuterContainer>
    );
  }

  return (
    <OuterContainer>
      <Nav returnTo={`/vampires/${id}/config`} />
      <MainContainer>
        <SectionsProvider sections={data.sections}>
          <AccessesProvider
            editors={data.editors || ['github|3338913']}
            viewers={data.viewers || ['github|3338913']}
            privateSheet={data.privateSheet}
          >
            <Config id={String(id)} name={data.infos.name} />
          </AccessesProvider>
        </SectionsProvider>
      </MainContainer>
      <Footer />
    </OuterContainer>
  );
};

export default ConfigWrapper;
