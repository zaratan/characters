import React, { useState, FormEvent } from 'react';
import styled from 'styled-components';
import { HorizontalSection } from '../styles/Sections';
import { EmptyLine } from '../styles/Lines';
import { Title } from '../styles/Titles';
import { HandLargeEditableText } from '../styles/Texts';

export interface InfosType {
  name?: string;
  playerName?: string;
  chronicle?: string;
  nature?: string;
  demeanor?: string;
  clan?: string;
  generation?: number;
  haven?: string;
  sire?: string;
}

const WritteableTitle = styled(Title)`
  display: inline;
`;

const InfoContainer = styled.span`
  display: flex;
`;

const Separator = styled.span`
  width: 1rem;
`;

const Infos = ({
  name,
  playerName,
  chronicle,
  nature,
  demeanor,
  clan,
  generation,
  haven,
  sire,
}: InfosType) => {
  const [localName, setLocalName] = useState(name);
  const [localPlayerName, setLocalPlayerName] = useState(playerName);
  const [localChronicle, setLocalChronicle] = useState(chronicle);
  const [localNature, setLocalNature] = useState(nature);
  const [localDemeanor, setLocalDemeanor] = useState(demeanor);
  const [localClan, setLocalClan] = useState(clan);
  const [localGeneration, setLocalGeneration] = useState(generation);
  const [localHaven, setLocalHaven] = useState(haven);
  const [localSire, setLocalSire] = useState(sire);
  const handleChange = (changeFunction: (val: string) => void) => (
    event: FormEvent<HTMLInputElement>
  ) => {
    changeFunction(event.currentTarget.value);
  };
  const handleChangeGeneration = (event: FormEvent<HTMLInputElement>) => {
    setLocalGeneration(Number(event.currentTarget.value));
  };
  return (
    <>
      <EmptyLine />

      <HorizontalSection>
        <InfoContainer>
          <WritteableTitle>Nom:</WritteableTitle>
          <Separator />
          <HandLargeEditableText
            type="text"
            value={localName}
            onChange={handleChange(setLocalName)}
          />
        </InfoContainer>
        <InfoContainer>
          <WritteableTitle>Joueur: </WritteableTitle>
          <Separator />
          <HandLargeEditableText
            type="text"
            value={localPlayerName}
            onChange={handleChange(setLocalPlayerName)}
          />
        </InfoContainer>
        <InfoContainer>
          <WritteableTitle>Chronique: </WritteableTitle>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(setLocalChronicle)}
            value={localChronicle}
          />
        </InfoContainer>
        <InfoContainer>
          <WritteableTitle>Nature: </WritteableTitle>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(setLocalNature)}
            value={localNature}
          />
        </InfoContainer>
        <InfoContainer>
          <WritteableTitle>Attitude: </WritteableTitle>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(setLocalDemeanor)}
            value={localDemeanor}
          />
        </InfoContainer>
        <InfoContainer>
          <WritteableTitle>Clan: </WritteableTitle>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(setLocalClan)}
            value={localClan}
          />
        </InfoContainer>
        <InfoContainer>
          <WritteableTitle>Génération: </WritteableTitle>
          <Separator />
          <HandLargeEditableText
            type="number"
            max={15}
            min={3}
            value={localGeneration}
            onChange={handleChangeGeneration}
          />
        </InfoContainer>
        <InfoContainer>
          <WritteableTitle>Refuge: </WritteableTitle>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(setLocalHaven)}
            value={localHaven}
          />
        </InfoContainer>
        <InfoContainer>
          <WritteableTitle>Sire: </WritteableTitle>
          <Separator />
          <HandLargeEditableText
            type="text"
            onChange={handleChange(setLocalSire)}
            value={localSire}
          />
        </InfoContainer>
      </HorizontalSection>
    </>
  );
};

export default Infos;
