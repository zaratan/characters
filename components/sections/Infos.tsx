import React, { FormEvent, useContext } from 'react';
import styled from 'styled-components';
import { HorizontalSection } from '../../styles/Sections';
import { EmptyLine } from '../../styles/Lines';
import { Title } from '../../styles/Titles';
import { HandLargeEditableText, HandLargeText } from '../../styles/Texts';
import InfosContext from '../../contexts/InfosContext';
import GenerationContext from '../../contexts/GenerationContext';
import ModeContext from '../../contexts/ModeContext';
import SectionsContext from '../../contexts/SectionsContext';

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

  const { editMode } = useContext(ModeContext);
  const generation = useContext(GenerationContext);
  const { useGeneration, useVampireInfos } = useContext(SectionsContext);
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
          {editMode ? (
            <HandLargeEditableText
              type="text"
              value={name.value}
              onChange={handleChange(name.set)}
            />
          ) : (
            <HandLargeText className="label">{name.value}</HandLargeText>
          )}
        </InfoContainer>
        <InfoContainer>
          <Title>Joueur: </Title>
          <Separator />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              value={playerName.value}
              onChange={handleChange(playerName.set)}
            />
          ) : (
            <HandLargeText className="label">{playerName.value}</HandLargeText>
          )}
        </InfoContainer>
        <InfoContainer>
          <Title>Chronique: </Title>
          <Separator />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              onChange={handleChange(chronicle.set)}
              value={chronicle.value}
            />
          ) : (
            <HandLargeText className="label">{chronicle.value}</HandLargeText>
          )}
        </InfoContainer>
        <InfoContainer>
          <Title>Nature: </Title>
          <Separator />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              onChange={handleChange(nature.set)}
              value={nature.value}
            />
          ) : (
            <HandLargeText className="label">{nature.value}</HandLargeText>
          )}
        </InfoContainer>
        <InfoContainer>
          <Title>Attitude: </Title>
          <Separator />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              onChange={handleChange(demeanor.set)}
              value={demeanor.value}
            />
          ) : (
            <HandLargeText className="label">{demeanor.value}</HandLargeText>
          )}
        </InfoContainer>
        {useVampireInfos ? (
          <InfoContainer>
            <Title>Clan: </Title>
            <Separator />
            {editMode ? (
              <HandLargeEditableText
                type="text"
                onChange={handleChange(clan.set)}
                value={clan.value}
              />
            ) : (
              <HandLargeText className="label">{clan.value}</HandLargeText>
            )}
          </InfoContainer>
        ) : null}
        {useGeneration ? (
          <InfoContainer>
            <Title>Génération: </Title>
            <Separator />
            {editMode ? (
              <HandLargeEditableText
                type="number"
                max={15}
                min={3}
                value={generation.value === 0 ? '' : generation.value}
                onChange={handleChangeGeneration}
              />
            ) : (
              <HandLargeText className="label">
                {generation.value}
              </HandLargeText>
            )}
          </InfoContainer>
        ) : null}
        <InfoContainer>
          <Title>Refuge: </Title>
          <Separator />
          {editMode ? (
            <HandLargeEditableText
              type="text"
              onChange={handleChange(haven.set)}
              value={haven.value}
            />
          ) : (
            <HandLargeText className="label">{haven.value}</HandLargeText>
          )}
        </InfoContainer>
        {useVampireInfos ? (
          <InfoContainer>
            <Title>Sire: </Title>
            <Separator />
            {editMode ? (
              <HandLargeEditableText
                type="text"
                onChange={handleChange(sire.set)}
                value={sire.value}
              />
            ) : (
              <HandLargeText className="label">{sire.value}</HandLargeText>
            )}
          </InfoContainer>
        ) : null}
      </HorizontalSection>
    </>
  );
};

export default Infos;
