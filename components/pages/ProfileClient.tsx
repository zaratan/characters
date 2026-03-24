'use client';

import { useContext, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MeContext from '../../contexts/MeContext';
import Nav from '../Nav';
import Footer from '../Footer';
import ErrorPage from '../ErrorPage';
import UserAvatar from '../UserAvatar';
import { BlackLine, EmptyLine } from '../../styles/Lines';
import { Title } from '../../styles/Titles';
import styles from './ProfileClient.module.css';

const ProfileClient = () => {
  const { me, connected, loading } = useContext(MeContext);
  const { update } = useSession();
  const router = useRouter();

  const [name, setName] = useState(me?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return null;
  }

  if (!connected || !me) {
    return <ErrorPage />;
  }

  const isOnboarding = !me.hasOnboarded;
  const hasChanged = name.trim() !== (me.name || '');
  const canSave = name.trim().length > 0 && hasChanged && !saving;

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Une erreur est survenue.');
        setSaving(false);
        return;
      }

      await update();
      router.refresh();

      if (isOnboarding) {
        router.replace('/');
      }
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex justify-between flex-col h-full">
      <div>
        <Nav />
        <EmptyLine />
        <EmptyLine>
          <BlackLine />
          <Title style={{ padding: '0 1rem', whiteSpace: 'nowrap' }}>
            Profil
          </Title>
          <BlackLine />
        </EmptyLine>
        <EmptyLine />
        <section className="w-full max-w-[24rem] mx-auto flex flex-col items-center">
          {isOnboarding && (
            <p className="text-center mb-6 leading-normal">
              Bienvenue ! Choisissez un nom d&apos;affichage pour que les autres
              joueurs puissent vous identifier.
            </p>
          )}
          <div className="mb-6">
            <UserAvatar
              name={me.name}
              image={me.image}
              userId={me.id}
              size={64}
            />
          </div>
          <div className="w-full mb-6">
            <label className={styles.label}>Email</label>
            <span className={styles.readOnlyValue}>{me.email}</span>
          </div>
          <div className="w-full mb-6">
            <label htmlFor="profile-name" className={styles.label}>
              Nom
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sombre Nosferatu"
              maxLength={100}
              className={styles.input}
            />
            {error && (
              <p className="text-red-600 dark:text-red-500 text-sm mt-2">
                {error}
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={styles.saveButton}
          >
            {saving
              ? 'Sauvegarde...'
              : isOnboarding
                ? 'Continuer'
                : 'Enregistrer'}
          </button>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default ProfileClient;
