import React, { useContext, useEffect, useState } from 'react';
import { useRouter, Router } from 'next/router';
import styled from 'styled-components';
import { GetStaticProps } from 'next';
import useSWR from 'swr';
import { useDebounce } from 'react-use';
import Footer from '../../../components/Footer';
import Nav from '../../../components/Nav';
import SectionsContext, {
  SectionsProvider,
  SectionsType,
} from '../../../contexts/SectionsContext';
import { fetchOneVampire } from '../../api/vampires/[id]';
import { VampireType } from '../../../types/VampireType';
import { fetchVampireFromDB } from '../../api/vampires';
import SystemContext from '../../../contexts/SystemContext';
import { Title } from '../../../styles/Titles';
import { EmptyLine, BlackLine } from '../../../styles/Lines';
import SectionTitle from '../../../components/SectionTitle';
import { Glyph } from '../../../components/Glyph';
import { fetcher } from '../../../helpers/fetcher';
import IdContext from '../../../contexts/IdContext';
import { TextFallback } from '../../new';
import MeContext from '../../../contexts/MeContext';
import ActionsFooter from '../../../components/ActionsFooter';

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

const OptionList = styled.ul``;
const ButtonList = styled.ul`
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(4rem, 1fr);
`;
const DangerousSection = styled.section``;
const ButtonLi = styled.li`
  position: relative;
`;
const RedButton = styled.button`
  background-color: #f2003c;
  padding: 1rem;
  border-radius: 2px;
  box-shadow: -1px -1px grey;
  outline: none;
  position: absolute;
  top: 0;
  left: 0;

  &:hover,
  &:focus {
    background-color: #c40233;
  }

  &:active {
    box-shadow: none;
    top: -1px;
    left: -1px;
  }
`;

const YesNoGlyph = ({
  value,
  name,
  onClick,
}: {
  value: boolean;
  name: string;
  onClick: () => void;
}) => (
  <>
    {value ? (
      <Glyph
        onClick={() => {
          if (!value) return;
          onClick();
        }}
        inactive={!value}
        name={`${name}: Non`}
      >
        ✘
      </Glyph>
    ) : (
      <Glyph
        onClick={() => {
          if (value) return;
          onClick();
        }}
        inactive={value}
        name={`${name}: Oui`}
      >
        ✔
      </Glyph>
    )}
  </>
);

const SectionLi = ({
  displayName,
  name,
  value,
  onClick,
}: {
  displayName: string;
  name: string;
  value: boolean;
  onClick: (name: string) => () => void;
}) => (
  <li>
    {displayName} : {value ? 'Oui' : 'Non'}{' '}
    <YesNoGlyph name={name} value={value} onClick={onClick(name)} />
  </li>
);

const Config = ({ id, name }: { id: string; name: string }) => {
  const {
    toggleSection,
    useBlood,
    useDisciplines,
    useGeneration,
    useHumanMagic,
    usePath,
    useTrueFaith,
    useVampireInfos,
  } = useContext(SectionsContext);
  const { appId } = useContext(SystemContext);
  const router = useRouter();
  const [sectionsChanged, setSectionsChanged] = useState(false);

  useDebounce(
    async () => {
      if (!sectionsChanged) return;
      const newSections: SectionsType = {
        blood: useBlood,
        disciplines: useDisciplines,
        generation: useGeneration,
        humanMagic: useHumanMagic,
        path: usePath,
        trueFaith: useTrueFaith,
        vampireInfos: useVampireInfos,
      };

      await fetcher(`/api/vampires/${id}/update_partial`, {
        method: 'POST',
        body: JSON.stringify({
          sections: newSections,
          appId,
        }),
      });
    },
    2000,
    [
      useBlood,
      useDisciplines,
      useGeneration,
      useHumanMagic,
      usePath,
      useTrueFaith,
      useVampireInfos,
      sectionsChanged,
    ]
  );

  const destroyFunction = async () => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        `Êtes vous sur de vouloir supprimer la fiche de ${name} ?`
      )
    )
      return;

    await fetcher(`/api/vampires/${id}/delete`, {
      method: 'POST',
    });
    router.push('/');
  };

  const changeSection = (sectionName: string) => () => {
    setSectionsChanged(true);
    toggleSection(sectionName)();
  };

  return (
    <>
      <Title>Options pour {name}</Title>
      <EmptyLine />
      <h2>Sections disponibles sur la fiche</h2>
      <OptionList>
        <SectionLi
          displayName="Sang"
          name="blood"
          value={useBlood}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Disciplines"
          name="disciplines"
          value={useDisciplines}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Génération"
          name="generation"
          value={useGeneration}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Magie humaine"
          name="humanMagic"
          value={useHumanMagic}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Voie"
          name="path"
          value={usePath}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Foi"
          name="trueFaith"
          value={useTrueFaith}
          onClick={changeSection}
        />
        <SectionLi
          displayName="Informations vampiriques"
          name="vampireInfos"
          value={useVampireInfos}
          onClick={changeSection}
        />
      </OptionList>
      <DangerousSection>
        <SectionTitle title="Danger" />
        <h2>
          Attention, les actions ci-dessous sont dangereuses et définitives
        </h2>
        <EmptyLine />
        <ButtonList>
          <ButtonLi>
            <RedButton onClick={destroyFunction}>
              Supprimer le personnage
            </RedButton>
          </ButtonLi>
        </ButtonList>
      </DangerousSection>
      <ActionsFooter
        actions={[{ glyph: '←', link: `/vampires/${id}`, name: 'Retour' }]}
      />
    </>
  );
};

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
  const { connected } = useContext(MeContext);
  const { data } = useSWR<VampireType>(`/api/vampires/${id}`, {
    initialData,
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
    return (
      <OuterContainer>
        <Nav />
        <TextFallback>
          Connectez vous pour configurer un personnage.
        </TextFallback>
        <Footer />
      </OuterContainer>
    );
  }

  return (
    <OuterContainer>
      <Nav />
      <MainContainer>
        <SectionsProvider sections={data.sections}>
          <Config id={String(id)} name={data.infos.name} />
        </SectionsProvider>
      </MainContainer>
      <Footer />
    </OuterContainer>
  );
};

export default ConfigWrapper;
