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
  width: 80%;
  margin: 0 auto;
`;

const AccessLists = styled.ul`
  display: flex;
  justify-content: space-around;
  width: 100%;
`;

const AccessList = styled.li`
  width: 100%;
  max-width: 20rem;
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
  const { editors, addEditor, removeEditor } = useContext(AccessesContext);
  const { appId } = useContext(SystemContext);

  const { data: usersData } = useSWR('/api/users');

  const [users, setUsers] = useState<Array<UserType>>([]);
  const [accessChanged, setAccessChanged] = useState(false);

  useEffect(() => {
    console.log({ position: 'useEffect', usersData });
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
          appId,
        }),
      });
      setAccessChanged(false);
    },
    300,
    [editors, accessChanged]
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

  const addAction = (user: UserType | string) => {
    if (typeof user === 'string') return;
    addEditor(user.sub);
    setAccessChanged(true);
  };

  const removeAction = (sub: string) => () => {
    if (editors.length < 2) return;

    removeEditor(sub);
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
                    onClick={removeAction(user.sub)}
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
            onSubmit={addAction}
            placeholder="Ajouter un éditeur"
            searchKeys={['name']}
          />
        </AccessList>
      </AccessLists>
    </MainContainer>
  );
};

export default ConfigAccessSection;
