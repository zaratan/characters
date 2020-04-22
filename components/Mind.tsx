import React from 'react';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import { ColumnTitle } from '../styles/Titles';
import Line from './Line';
import { calcPexDiffWillpower, calcPexDiffPathOrVirtue } from '../helpers/pex';
import SquareLine from './SquareLine';
import Health from './Health';
import { maxBlood } from '../helpers/maxLevels';

export type MindType = {
  willpower: number;
  tempWillpower: number;
  bloodSpent: number;
  conscience: number;
  selfControl: number;
  courage: number;
  path: number;
  extraBruised?: number;
  bruised: number;
  hurt: number;
  injured: number;
  wounded: number;
  mauled: number;
  crippled: number;
  incapacitated: number;
};

const Mind = ({
  willpower,
  tempWillpower,
  bloodSpent,
  conscience,
  selfControl,
  courage,
  path,
  extraBruised,
  bruised,
  hurt,
  injured,
  wounded,
  mauled,
  crippled,
  incapacitated,
  generation,
}: MindType & { generation: number }) => (
  <>
    <StyledLine />
    <HorizontalSection>
      <div>
        <ColumnTitle>Volonté</ColumnTitle>
        <Line
          value={willpower}
          maxLevel={10}
          minLevel={1}
          diffPexCalc={calcPexDiffWillpower}
        />
        <SquareLine number={10} numberChecked={tempWillpower} />
        <ColumnTitle>Réserve de Sang</ColumnTitle>
        <SquareLine
          number={maxBlood(generation)}
          numberChecked={tempWillpower}
        />
      </div>
      <div>
        <ColumnTitle>Vertues</ColumnTitle>
        <Line
          title="Conscience"
          value={conscience}
          maxLevel={5}
          minLevel={1}
          diffPexCalc={calcPexDiffPathOrVirtue}
        />
        <Line
          title="Maitrise de soi"
          value={selfControl}
          maxLevel={5}
          minLevel={1}
          diffPexCalc={calcPexDiffPathOrVirtue}
        />
        <Line
          title="Courage"
          value={courage}
          maxLevel={5}
          minLevel={1}
          diffPexCalc={calcPexDiffPathOrVirtue}
        />
        <ColumnTitle>Voie</ColumnTitle>
        <Line
          value={path}
          maxLevel={10}
          minLevel={1}
          diffPexCalc={calcPexDiffPathOrVirtue}
        />
      </div>
      <Health
        extraSquare={extraBruised}
        bruised={bruised}
        hurt={hurt}
        injured={injured}
        wounded={wounded}
        mauled={mauled}
        crippled={crippled}
        incapacitated={incapacitated}
      />
    </HorizontalSection>
  </>
);

export default Mind;
