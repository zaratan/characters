import React from 'react';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import { ColumnTitle } from '../styles/Titles';
import Line from './Line';
import { calcPexDiffWillpower, calcPexDiffPathOrVirtue } from '../helpers/pex';
import SquareLine from './SquareLine';
import NamedSquare from './NamedSquare';

const MiscElem = () => (
  <>
    <StyledLine />
    <HorizontalSection>
      <div>
        <ColumnTitle>Volonté</ColumnTitle>
        <Line
          value={3}
          maxLevel={10}
          minLevel={1}
          diffPexCalc={calcPexDiffWillpower}
        />
        <SquareLine />
        <ColumnTitle>Réserve de Sang</ColumnTitle>
      </div>
      <div>
        <ColumnTitle>Vertues</ColumnTitle>
        <Line
          title="Conscience"
          value={1}
          maxLevel={5}
          minLevel={1}
          diffPexCalc={calcPexDiffPathOrVirtue}
        />
        <Line
          title="Maitrise de soi"
          value={2}
          maxLevel={5}
          minLevel={1}
          diffPexCalc={calcPexDiffPathOrVirtue}
        />
        <Line
          title="Courage"
          value={3}
          maxLevel={5}
          minLevel={1}
          diffPexCalc={calcPexDiffPathOrVirtue}
        />
        <ColumnTitle>Voie</ColumnTitle>
        <Line
          value={3}
          maxLevel={10}
          minLevel={1}
          diffPexCalc={calcPexDiffPathOrVirtue}
        />
      </div>
      <div>
        <ColumnTitle>Santé</ColumnTitle>
        <NamedSquare value={0} />
      </div>
    </HorizontalSection>
  </>
);

export default MiscElem;
