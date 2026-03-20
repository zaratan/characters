'use client';

import { useContext, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import MeContext from '../../contexts/MeContext';
import Nav from '../Nav';
import Footer from '../Footer';
import ErrorPage from '../ErrorPage';
import UserAvatar from '../UserAvatar';
import { BlackLine, EmptyLine } from '../../styles/Lines';
import { Title } from '../../styles/Titles';

const MainContainer = styled.main`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
`;

const FormContainer = styled.section`
  width: 100%;
  max-width: 24rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FieldGroup = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: ${(props) => props.theme.titleColor};
`;

const ReadOnlyValue = styled.span`
  display: block;
  padding: 0.5rem;
  color: ${(props) => props.theme.glyphGray};
  font-size: 1rem;
`;

const Input = styled.input`
  border: 1px solid ${(props) => props.theme.borderColor};
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};
  padding: 0.5rem;
  width: 100%;
  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.focusBorderColor};
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1.5rem;
  border: 1px solid ${(props) => props.theme.borderColor};
  background-color: ${(props) => props.theme.actionBackground};
  color: ${(props) => props.theme.color};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  &:hover,
  &:focus {
    background-color: ${(props) => props.theme.hoverBackgroundColor};
    outline: none;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: ${(props) => props.theme.red};
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const WelcomeMessage = styled.p`
  text-align: center;
  margin-bottom: 1.5rem;
  color: ${(props) => props.theme.color};
  line-height: 1.5;
`;

const AvatarWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

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
    <MainContainer>
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
        <FormContainer>
          {isOnboarding && (
            <WelcomeMessage>
              Bienvenue ! Choisissez un nom d&apos;affichage pour que les autres
              joueurs puissent vous identifier.
            </WelcomeMessage>
          )}
          <AvatarWrapper>
            <UserAvatar
              name={me.name}
              image={me.image}
              userId={me.id}
              size={64}
            />
          </AvatarWrapper>
          <FieldGroup>
            <Label>Email</Label>
            <ReadOnlyValue>{me.email}</ReadOnlyValue>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="profile-name">Nom</Label>
            <Input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sombre Nosferatu"
              maxLength={100}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </FieldGroup>
          <SaveButton onClick={handleSave} disabled={!canSave}>
            {}
            {saving
              ? 'Sauvegarde...'
              : isOnboarding
                ? 'Continuer'
                : 'Enregistrer'}
          </SaveButton>
        </FormContainer>
      </div>
      <Footer />
    </MainContainer>
  );
};

export default ProfileClient;
