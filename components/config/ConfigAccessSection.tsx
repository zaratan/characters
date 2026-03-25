import isEqual from 'lodash/isEqual';
import { useContext, useEffect, useRef, useState } from 'react';
import useDebounce from '../../hooks/useDebounce';
import useSWR from 'swr';
import AccessesContext from '../../contexts/AccessesContext';
import SystemContext from '../../contexts/SystemContext';
import { fetcher } from '../../helpers/fetcher';
import { useToast } from '../../contexts/ToastContext';

import { EmptyLine } from '../../styles/Lines';
import type { UserType } from '../../types/UserType';
import AutoCompleteInput from '../AutoCompleteInput';
import { Glyph } from '../Glyph';
import SectionTitle from '../SectionTitle';

const ConfigAccessSection = ({ id }: { id: string }) => {
  const { editors, addEditor, removeEditor, addViewer, removeViewer, viewers } =
    useContext(AccessesContext);
  const { appId } = useContext(SystemContext);
  const { showError } = useToast();

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
      } catch {
        showError('Erreur lors de la sauvegarde des accès.');
        setAccessChanged(false);
      }
    },
    300,
    [editors, accessChanged, viewers]
  );

  if (!usersData || users.length === 0)
    return (
      <section className="w-[70%] mx-auto max-xl-plus:w-4/5">
        <SectionTitle title="Access" />
        <EmptyLine />
        <strong className="h-full grow flex justify-center items-center">
          Chargement…
        </strong>
      </section>
    );

  const editorsWithData = editors
    .map((e) => users.find((user) => user.id === e))
    .filter((u): u is UserType => u !== undefined);

  const viewersWithData = viewers
    .map((e) => users.find((user) => user.id === e))
    .filter((u): u is UserType => u !== undefined);

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
    <section className="w-[70%] mx-auto max-xl-plus:w-4/5">
      <SectionTitle title="Access" />
      <ul className="flex justify-around w-full max-xl-plus:flex-col max-xl-plus:justify-center max-xl-plus:items-center">
        <li className="w-full max-w-[20rem] max-xl-plus:[&:not(:first-child)]:mt-8">
          <h2 className="text-center mb-4">Éditeurs</h2>
          <ul className="list-inside pb-8">
            {editorsWithData.map((user) => (
              <li key={user.id} className="flex justify-between w-full">
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
              </li>
            ))}
          </ul>
          <AutoCompleteInput
            autocompleteOptions={users.filter(
              (user) => !editors.includes(user.id)
            )}
            display="name"
            onSubmit={addEditorAction}
            placeholder="Ajouter un éditeur"
            searchKeys={['name']}
          />
        </li>
        <li className="w-full max-w-[20rem] max-xl-plus:[&:not(:first-child)]:mt-8">
          <h2 className="text-center mb-4">Viewer</h2>
          <ul className="list-inside pb-8">
            {viewersWithData.map((user) => (
              <li key={user.id} className="flex justify-between w-full">
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
              </li>
            ))}
          </ul>
          <AutoCompleteInput
            autocompleteOptions={users.filter(
              (user) => !viewers.includes(user.id)
            )}
            display="name"
            onSubmit={addViewerAction}
            placeholder="Ajouter un viewer"
            searchKeys={['name']}
          />
        </li>
      </ul>
    </section>
  );
};

export default ConfigAccessSection;
