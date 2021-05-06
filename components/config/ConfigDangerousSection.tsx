import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { useDebounce } from 'react-use';
import styled from 'styled-components';
import AccessesContext from '../../contexts/AccessesContext';
import SystemContext from '../../contexts/SystemContext';
import { fetcher } from '../../helpers/fetcher';
import { EmptyLine } from '../../styles/Lines';
import SectionTitle from '../SectionTitle';

const ButtonList = styled.ul`
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(4rem, 1fr);
`;
const DangerousSection = styled.section`
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const ButtonLi = styled.li`
  position: relative;
`;
const RedButton = styled.button`
  background-color: #f2003c;
  padding: 1rem;
  border-radius: 2px;
  box-shadow: -1px -1px grey;
  outline: none;

  &:hover,
  &:focus {
    background-color: #c40233;
  }
`;

const DangerousActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
`;

const ConfigDangerousSection = ({ id, name }: { id: string; name: string }) => {
  const router = useRouter();
  const { privateSheet, togglePrivate } = useContext(AccessesContext);
  const { appId } = useContext(SystemContext);

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

  const [visibilityChanged, setVisibilityChanged] = useState(false);

  useDebounce(
    async () => {
      if (!visibilityChanged) return;

      await fetcher(`/api/vampires/${id}/update_partial`, {
        method: 'POST',
        body: JSON.stringify({
          privateSheet,
          appId,
        }),
      });
      setVisibilityChanged(false);
    },
    300,
    [visibilityChanged, privateSheet]
  );

  return (
    <DangerousSection>
      <SectionTitle title="Danger" />
      <h2>Attention, les actions ci-dessous sont dangereuses et définitives</h2>
      <EmptyLine />
      <DangerousActionsContainer>
        <ButtonList>
          <ButtonLi>
            <RedButton onClick={destroyFunction}>
              Supprimer le personnage
            </RedButton>
          </ButtonLi>
          <ButtonLi>
            <RedButton
              onClick={() => {
                setVisibilityChanged(true);
                togglePrivate();
              }}
            >
              {privateSheet
                ? 'Rendre la feuille publique'
                : 'Rendre la feuille privée'}
            </RedButton>
          </ButtonLi>
        </ButtonList>
      </DangerousActionsContainer>
      <EmptyLine />
    </DangerousSection>
  );
};

export default ConfigDangerousSection;
