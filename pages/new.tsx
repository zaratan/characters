import React, { useState, FormEvent, useContext } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { v4 as uuid } from 'uuid';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { EmptyLine } from '../styles/Lines';
import MeContext from '../contexts/MeContext';
import { fetcher } from '../helpers/fetcher';
import SystemContext from '../contexts/SystemContext';
import ErrorPage from '../components/ErrorPage';

export const ERAS = {
  0: 'Age des ténèbres',
  1: 'Victorienne',
};

export const TYPES = {
  0: 'Vampire',
  1: 'Humain',
  2: 'Goule',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const FormContainer = styled.main`
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1px solid grey;
  padding: 8rem 12rem;
  @media screen and (max-width: 750px) {
    padding: 0;
    border: 0;
    padding-top: 3rem;
  }
`;

const Header = styled.header`
  font-size: 1.5rem;
  align-self: center;
`;

const Label = styled.span`
  padding-right: 1rem;
`;

const Field = styled.label`
  padding-bottom: 1.5rem;
  display: flex;
  align-items: center;
`;

const TextInput = styled.input`
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};
  padding: 0.5rem;
  &:focus {
    outline: none;
    border-bottom: 1px solid ${(props) => props.theme.focusBorderColor};
  }
`;

export const TextFallback = styled.strong`
  height: 100%;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  a {
    margin-left: 0.25rem;
    text-decoration: underline;
  }
`;

const Select = styled.select`
  flex-grow: 1;
  padding: 0.5rem;
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};
`;

const Button = styled.input`
  padding: 0.5rem;
`;

const CheckBox = styled.input`
  background-color: ${(props) => props.theme.background};
`;

const NewCharPage = () => {
  const [name, setName] = useState('');
  const [era, setEra] = useState(0);
  const [type, setType] = useState(0);
  const [privateSheet, setPrivateSheet] = useState(false);

  const router = useRouter();
  const id = uuid();

  const { connected } = useContext(MeContext);
  const { appId } = useContext(SystemContext);

  if (!connected) {
    return <ErrorPage />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const url = '/api/vampires/create';
    await fetcher(url, {
      method: 'POST',
      body: JSON.stringify({ name, era, type, id, appId, privateSheet }),
    });
    router.push(`/vampires/${id}`);
  };

  return (
    <Container>
      <Nav returnTo="/new" />
      <FormContainer>
        <Form onSubmit={onSubmit}>
          <Header>Nouveau personnage</Header>
          <EmptyLine />
          <Field htmlFor="new-char-name">
            <Label>Nom :</Label>
            <TextInput
              type="text"
              name="name"
              id="new-char-name"
              placeholder="Nom du personnage"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </Field>
          <Field htmlFor="new-char-era">
            <Label>Époque :</Label>
            <Select
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
            </Select>
          </Field>
          <Field htmlFor="new-char-type">
            <Label>Type :</Label>
            <Select
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
            </Select>
          </Field>
          <Field htmlFor="new-char-private">
            <Label>Feuille privée ? :</Label>
            <CheckBox
              type="checkbox"
              name="privateSheet"
              id="new-char-private"
              checked={privateSheet}
              onChange={(e) => setPrivateSheet(e.target.checked)}
            />
          </Field>
          <EmptyLine />
          <Button type="submit" value="Créer" />
        </Form>
      </FormContainer>
      <Footer />
    </Container>
  );
};

export default NewCharPage;
