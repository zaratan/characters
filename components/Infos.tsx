import React from 'react';
import styled from 'styled-components';
import { HorizontalSection } from '../styles/Sections';
import { EmptyLine } from '../styles/Lines';
import { Title } from '../styles/Titles';

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
        {name}
      </span>
      <span>
        <WritteableTitle>Joueur: </WritteableTitle>
        {playerName}
      </span>
      <span>
        <WritteableTitle>Chronique: </WritteableTitle>
        {chronicle}
      </span>
      <span>
        <WritteableTitle>Nature: </WritteableTitle>
        {nature}
      </span>
      <span>
        <WritteableTitle>Attitude: </WritteableTitle>
        {demeanor}
      </span>
      <span>
        <WritteableTitle>Clan: </WritteableTitle>
        {clan}
      </span>
      <span>
        <WritteableTitle>Génération: </WritteableTitle>
        {generation}
      </span>
      <span>
        <WritteableTitle>Refuge: </WritteableTitle>
        {haven}
      </span>
      <span>
        <WritteableTitle>Sire: </WritteableTitle>
        {sire}
      </span>
    </HorizontalSection>
  </>
);

export default Infos;
