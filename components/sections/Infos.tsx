import React, { FormEvent, useContext } from 'react';
import styled from 'styled-components';
import { HorizontalSection } from '../../styles/Sections';
import { EmptyLine } from '../../styles/Lines';
import { Title } from '../../styles/Titles';
import { HandLargeEditableText } from '../../styles/Texts';
import InfosContext from '../../contexts/InfosContext';
import GenerationContext from '../../contexts/GenerationContext';

const InfoContainer = styled.div`
  display: flex;
  @media screen and (max-width: 500px) {
    display: block;
  }
`;

const Separator = styled.span`
  width: 1rem;
`;

const Infos = () => {
  const {
    name,
    playerName,
    chronicle,
    clan,
    demeanor,
    haven,
    nature,
    sire,
  } = useContext(InfosContext);

  const generation = useContext(GenerationContext);
  const handleChange = (changeFunction: (val: string) => void) => (
    event: FormEvent<HTMLInputElement>
  ) => {
    changeFunction(event.currentTarget.value);
  };
  const handleChangeGeneration = (event: FormEvent<HTMLInputElement>) => {
    generation.set(Number(event.currentTarget.value));
  };
  return (
    <>
      <EmptyLine />

      <HorizontalSection className="compact">
        <InfoContainer>
          <Title>Nom:</Title>
          <Separator />
          <HandLargeEditableText
            type="text"
            value={name.value}
            onChange={handleChange(name.set)}
          />
        </InfoContainer>
        <InfoContainer>
          <Title>Joueur: </Title>
          <Separator />
          <HandLargeEditableText
            type="text"
            value={playerName.value}
            onChange={handleChange(playerName.set)}
          />
        </InfoContainer>
        <InfoContainer>
          <Title>Chronique: </Title>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(chronicle.set)}
            value={chronicle.value}
          />
        </InfoContainer>
        <InfoContainer>
          <Title>Nature: </Title>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(nature.set)}
            value={nature.value}
          />
        </InfoContainer>
        <InfoContainer>
          <Title>Attitude: </Title>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(demeanor.set)}
            value={demeanor.value}
          />
        </InfoContainer>
        <InfoContainer>
          <Title>Clan: </Title>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(clan.set)}
            value={clan.value}
          />
        </InfoContainer>
        <InfoContainer>
          <Title>Génération: </Title>
          <Separator />
          <HandLargeEditableText
            type="number"
            max={15}
            min={3}
            value={generation.value === 0 ? '' : generation.value}
            onChange={handleChangeGeneration}
          />
        </InfoContainer>
        <InfoContainer>
          <Title>Refuge: </Title>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(haven.set)}
            value={haven.value}
          />
        </InfoContainer>
        <InfoContainer>
          <Title>Sire: </Title>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(sire.set)}
            value={sire.value}
          />
        </InfoContainer>
      </HorizontalSection>
    </>
  );
};

export default Infos;
