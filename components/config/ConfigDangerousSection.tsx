import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import useDebounce from '../../hooks/useDebounce';
import AccessesContext from '../../contexts/AccessesContext';
import SystemContext from '../../contexts/SystemContext';
import { fetcher } from '../../helpers/fetcher';
import { EmptyLine } from '../../styles/Lines';
import SectionTitle from '../SectionTitle';
import styles from './ConfigDangerousSection.module.css';

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

    try {
      await fetcher(`/api/vampires/${id}`, {
        method: 'DELETE',
      });
      router.push('/');
    } catch {
      window.alert('Erreur lors de la suppression du personnage.');
    }
  };

  const [visibilityChanged, setVisibilityChanged] = useState(false);

  useDebounce(
    async () => {
      if (!visibilityChanged) return;

      try {
        await fetcher(`/api/vampires/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            privateSheet,
            appId,
          }),
        });
        setVisibilityChanged(false);
      } catch {
        togglePrivate();
        setVisibilityChanged(false);
      }
    },
    300,
    [visibilityChanged, privateSheet]
  );

  return (
    <section className="w-4/5 flex flex-col items-center">
      <SectionTitle title="Danger" />
      <h2>Attention, les actions ci-dessous sont dangereuses et définitives</h2>
      <EmptyLine />
      <div className="flex justify-around w-full">
        <ul className="grid gap-4 grid-cols-3 auto-rows-[minmax(4rem,1fr)]">
          <li className="relative">
            <button className={styles.redButton} onClick={destroyFunction}>
              Supprimer le personnage
            </button>
          </li>
          <li className="relative">
            <button
              className={styles.redButton}
              onClick={() => {
                setVisibilityChanged(true);
                togglePrivate();
              }}
            >
              {privateSheet
                ? 'Rendre la feuille publique'
                : 'Rendre la feuille privée'}
            </button>
          </li>
        </ul>
      </div>
      <EmptyLine />
    </section>
  );
};

export default ConfigDangerousSection;
