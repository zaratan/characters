import { concat } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import useDebounce from 'react-use/lib/useDebounce';
import styled from 'styled-components';
import useSWR from 'swr';
import AccessesContext from '../../contexts/AccessesContext';
import SystemContext from '../../contexts/SystemContext';
import { fetcher } from '../../helpers/fetcher';
import { TextFallback } from '../../pages/new';
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
  const {
    editors,
    addEditor,
    removeEditor,
    addViewer,
    removeViewer,
    viewers,
  } = useContext(AccessesContext);
  const { appId } = useContext(SystemContext);

  const { data: usersData } = useSWR('/api/users');

  const [users, setUsers] = useState<Array<UserType>>([]);
  const [accessChanged, setAccessChanged] = useState(false);

  useEffect(() => {
    setUsers(usersData?.users || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(usersData?.users)]);

  useDebounce(
    async () => {
      if (!accessChanged) return;

      await fetcher(`/api/vampires/${id}/update_partial`, {
        method: 'POST',
        body: JSON.stringify({
          editors,
          viewers,
          appId,
        }),
      });
      setAccessChanged(false);
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
    editors.map((e) => users.find((user) => user.sub === e))
  );

  const viewersWithData = concat(
    viewers.map((e) => users.find((user) => user.sub === e))
  );

  const addEditorAction = (user: UserType | string) => {
    if (typeof user === 'string') return;
    addEditor(user.sub);
    setAccessChanged(true);
  };

  const removeEditorAction = (sub: string) => () => {
    if (editors.length < 2) return;

    removeEditor(sub);
    setAccessChanged(true);
  };

  const addViewerAction = (user: UserType | string) => {
    if (typeof user === 'string') return;
    addViewer(user.sub);
    setAccessChanged(true);
  };

  const removeViewerAction = (sub: string) => () => {
    if (viewers.length < 2) return;

    removeViewer(sub);
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
              <AccessUser key={user.sub}>
                {user.name}
                {editors.length > 1 ? (
                  <Glyph
                    name={`Remove ${user.name} editor access`}
                    onClick={removeEditorAction(user.sub)}
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
              (user) => !editors.includes(user.sub)
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
              <AccessUser key={user.sub}>
                {user.name}
                {viewers.length > 1 ? (
                  <Glyph
                    name={`Remove ${user.name} viewer access`}
                    onClick={removeViewerAction(user.sub)}
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
              (user) => !viewers.includes(user.sub)
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
