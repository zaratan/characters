'use client';
import { useContext } from 'react';
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
      <div className="flex flex-col min-h-full">
        <Nav />
        <strong className="h-full grow flex justify-center items-center">
          Vous n&apos;avez pas accès à la configuration de ce personnage.
        </strong>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Nav returnTo={`/vampires/${id}/config`} />
      <main className="grow flex flex-col items-center">
        <SectionsProvider sections={data!.sections}>
          <AccessesProvider
            editors={data!.editors || []}
            viewers={data!.viewers || []}
            privateSheet={data!.privateSheet}
          >
            <Config id={id} name={data!.infos.name} />
          </AccessesProvider>
        </SectionsProvider>
      </main>
      <Footer />
    </div>
  );
};

export default ConfigClient;
