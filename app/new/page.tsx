'use client';
import type { FormEvent } from 'react';
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { EmptyLine } from '../../styles/Lines';
import MeContext from '../../contexts/MeContext';
import { fetcher } from '../../helpers/fetcher';
import SystemContext from '../../contexts/SystemContext';
import ErrorPage from '../../components/ErrorPage';

const ERAS = {
  0: 'Age des ténèbres',
  1: 'Victorienne',
};

const TYPES = {
  0: 'Vampire',
  1: 'Humain',
  2: 'Goule',
};

const NewCharPage = () => {
  const [name, setName] = useState('');
  const [era, setEra] = useState(0);
  const [type, setType] = useState(0);
  const [privateSheet, setPrivateSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const { connected } = useContext(MeContext);
  const { appId } = useContext(SystemContext);

  if (!connected) {
    return <ErrorPage />;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');

    try {
      const url = '/api/vampires/create';
      const result = await fetcher(url, {
        method: 'POST',
        body: JSON.stringify({ name, era, type, appId, privateSheet }),
      });
      router.push(`/vampires/${result.id}`);
    } catch {
      setError('Une erreur est survenue lors de la création.');
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <Nav returnTo="/new" />
      <main className="grow flex flex-col justify-center items-center">
        <form
          className="flex flex-col rounded-[10px] border border-gray-300 dark:border-gray-500 py-32 px-48 max-lg-plus:border-0 max-lg-plus:p-0 max-lg-plus:pt-12"
          onSubmit={onSubmit}
        >
          <header className="text-[1.5rem] text-center">
            Nouveau personnage
          </header>
          <EmptyLine />
          <label className="pb-6 flex items-center" htmlFor="new-char-name">
            <span className="pr-4">Nom :</span>
            <input
              className="border-0 border-solid border-b border-gray-300 dark:border-gray-500 bg-transparent text-inherit p-2 focus:border-[#8bcbe0] focus:outline-none"
              type="text"
              name="name"
              id="new-char-name"
              placeholder="Nom du personnage"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </label>
          <label className="pb-6 flex items-center" htmlFor="new-char-era">
            <span className="pr-4">Époque :</span>
            <select
              className="grow p-2 bg-transparent text-inherit"
              name="era"
              id="new-char-era"
              value={era}
              onChange={(e) => setEra(Number(e.target.value))}
            >
              {Object.entries(ERAS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="pb-6 flex items-center" htmlFor="new-char-type">
            <span className="pr-4">Type :</span>
            <select
              className="grow p-2 bg-transparent text-inherit"
              name="type"
              id="new-char-type"
              value={type}
              onChange={(e) => setType(Number(e.target.value))}
            >
              {Object.entries(TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="pb-6 flex items-center" htmlFor="new-char-private">
            <span className="pr-4">Feuille privée ? :</span>
            <input
              className="bg-transparent"
              type="checkbox"
              name="privateSheet"
              id="new-char-private"
              checked={privateSheet}
              onChange={(e) => setPrivateSheet(e.target.checked)}
            />
          </label>
          <EmptyLine />
          {error && (
            <p className="text-red-600 dark:text-red-500 text-sm mt-2">
              {error}
            </p>
          )}
          <input
            className="p-2 px-6 mt-4 cursor-pointer border border-gray-300 dark:border-gray-500 rounded-[5px] hover:shadow-[1px_1px_1px] active:shadow-none active:translate-x-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            value={saving ? 'Création...' : 'Créer'}
            disabled={saving || !name.trim()}
          />
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default NewCharPage;
