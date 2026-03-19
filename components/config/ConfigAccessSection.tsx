import { concat, isEqual } from 'lodash';
import React, { useContext, useEffect, useRef, useState } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import styled from 'styled-components';
import useSWR from 'swr';
import AccessesContext from '../../contexts/AccessesContext';
import SystemContext from '../../contexts/SystemContext';
import { fetcher } from '../../helpers/fetcher';
import TextFallback from '../../styles/TextFallback';
import { EmptyLine } from '../../styles/Lines';
import { UserType } from '../../types/UserType';
import AutoCompleteInput from '../AutoCompleteInput';
import { Glyph } from '../Glyph';
import SectionTitle from '../SectionTitle';

const MainContainer = styled.section`
  width: 70%;
  margin: 0 auto;
  @media screen and (max-width: 930px) {
    width: 80%;
  }
`;

const AccessLists = styled.ul`
  display: flex;
  justify-content: space-around;
  width: 100%;
  @media screen and (max-width: 930px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

const AccessList = styled.li`
  width: 100%;
  max-width: 20rem;
  @media screen and (max-width: 930px) {
    &:not(:first-child) {
      margin-top: 2rem;
    }
  }
`;

const AccessTitle = styled.h3`
  text-align: center;
  margin-bottom: 1rem;
`;

const AccessUsers = styled.ul`
  list-style: inside;
  padding-bottom: 2rem;
`;

const AccessUser = styled.li`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ConfigAccessSection = ({ id }: { id: string }) => {
  const { editors, addEditor, removeEditor, addViewer, removeViewer, viewers } =
    useContext(AccessesContext);
  const { appId } = useContext(SystemContext);

  const { data: usersData } = useSWR('/api/users');

  const [users, setUsers] = useState<Array<UserType>>([]);
  const [accessChanged, setAccessChanged] = useState(false);

  const prevUsers = useRef(usersData?.users);
  useEffect(() => {
    if (!isEqual(prevUsers.current, usersData?.users)) {
      prevUsers.current = usersData?.users;
      setUsers(usersData?.users || []);
    }
  }, [usersData?.users]);

  useDebounce(
    async () => {
      if (!accessChanged) return;

      try {
        await fetcher(`/api/vampires/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            editors,
            viewers,
            appId,
          }),
        });
        setAccessChanged(false);
      } catch (err) {
        console.error('Failed to save access changes:', err);
        setAccessChanged(false);
      }
    },
    300,
    [editors, accessChanged, viewers]
  );

  if (!usersData || users.length === 0)
    return (
      <MainContainer>
        <SectionTitle title="Access" />
        <EmptyLine />
        <TextFallback>Chargement…</TextFallback>;
      </MainContainer>
    );

  const editorsWithData = concat(
    editors.map((e) => users.find((user) => user.id === e))
  ).filter((u): u is UserType => u !== undefined);

  const viewersWithData = concat(
    viewers.map((e) => users.find((user) => user.id === e))
  ).filter((u): u is UserType => u !== undefined);

  const addEditorAction = (user: UserType | string) => {
    if (typeof user === 'string') return;
    addEditor(user.id);
    setAccessChanged(true);
  };

  const removeEditorAction = (id: string) => () => {
    if (editors.length < 2) return;

    removeEditor(id);
    setAccessChanged(true);
  };

  const addViewerAction = (user: UserType | string) => {
    if (typeof user === 'string') return;
    addViewer(user.id);
    setAccessChanged(true);
  };

  const removeViewerAction = (id: string) => () => {
    if (viewers.length < 2) return;

    removeViewer(id);
    setAccessChanged(true);
  };

  return (
    <MainContainer>
      <SectionTitle title="Access" />
      <AccessLists>
        <AccessList>
          <AccessTitle>Éditeurs</AccessTitle>
          <AccessUsers>
            {editorsWithData.map((user) => (
              <AccessUser key={user.id}>
                {user.name}
                {editors.length > 1 ? (
                  <Glyph
                    name={`Remove ${user.name} editor access`}
                    onClick={removeEditorAction(user.id)}
                  >
                    ✘
                  </Glyph>
                ) : (
                  <span />
                )}
              </AccessUser>
            ))}
          </AccessUsers>
          <AutoCompleteInput
            autocompleteOptions={users.filter(
              (user) => !editors.includes(user.id)
            )}
            display="name"
            onSubmit={addEditorAction}
            placeholder="Ajouter un éditeur"
            searchKeys={['name']}
          />
        </AccessList>
        <AccessList>
          <AccessTitle>Viewer</AccessTitle>
          <AccessUsers>
            {viewersWithData.map((user) => (
              <AccessUser key={user.id}>
                {user.name}
                {viewers.length > 1 ? (
                  <Glyph
                    name={`Remove ${user.name} viewer access`}
                    onClick={removeViewerAction(user.id)}
                  >
                    ✘
                  </Glyph>
                ) : (
                  <span />
                )}
              </AccessUser>
            ))}
          </AccessUsers>
          <AutoCompleteInput
            autocompleteOptions={users.filter(
              (user) => !viewers.includes(user.id)
            )}
            display="name"
            onSubmit={addViewerAction}
            placeholder="Ajouter un viewer"
            searchKeys={['name']}
          />
        </AccessList>
      </AccessLists>
    </MainContainer>
  );
};

export default ConfigAccessSection;
