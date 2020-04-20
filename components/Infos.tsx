import React from 'react';
import styled from 'styled-components';
import { HorizontalSection } from '../styles/Sections';
import { EmptyLine } from '../styles/Lines';
import { Title } from '../styles/Titles';
import { HandLargeText } from '../styles/Texts';

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
}: InfosType) => (
  <>
    <EmptyLine />

    <HorizontalSection>
      <span>
        <WritteableTitle>Nom: </WritteableTitle>
        <HandLargeText>{name}</HandLargeText>
      </span>
      <span>
        <WritteableTitle>Joueur: </WritteableTitle>
        <HandLargeText>{playerName}</HandLargeText>
      </span>
      <span>
        <WritteableTitle>Chronique: </WritteableTitle>
        <HandLargeText>{chronicle}</HandLargeText>
      </span>
      <span>
        <WritteableTitle>Nature: </WritteableTitle>
        <HandLargeText>{nature}</HandLargeText>
      </span>
      <span>
        <WritteableTitle>Attitude: </WritteableTitle>
        <HandLargeText>{demeanor}</HandLargeText>
      </span>
      <span>
        <WritteableTitle>Clan: </WritteableTitle>
        <HandLargeText>{clan}</HandLargeText>
      </span>
      <span>
        <WritteableTitle>Génération: </WritteableTitle>
        <HandLargeText>{generation}</HandLargeText>
      </span>
      <span>
        <WritteableTitle>Refuge: </WritteableTitle>
        <HandLargeText>{haven}</HandLargeText>
      </span>
      <span>
        <WritteableTitle>Sire: </WritteableTitle>
        <HandLargeText>{sire}</HandLargeText>
      </span>
    </HorizontalSection>
  </>
);

export default Infos;
