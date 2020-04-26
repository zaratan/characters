import React, { useState } from 'react';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import { ColumnTitle } from '../styles/Titles';
import Line from './Line';
import { calcPexDiffWillpower, calcPexDiffPathOrVirtue } from '../helpers/pex';
import SquareLine from './SquareLine';
import Health from './Health';
import { maxBlood } from '../helpers/maxLevels';
import UnderlinedHandLargeEditableText from './UnderlinedHandLargeEditableText';
import ColumnTitleWithOptions from './ColumnTitleWithOptions';

export type MindType = {
  willpower: number;
  tempWillpower: number;
  bloodSpent: number;
  conscience: number;
  isConviction: boolean;
  isInstinct: boolean;
  selfControl: number;
  courage: number;
  pathName: string;
  path: number;
  isExtraBruisable: boolean;
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
  isConviction,
  selfControl,
  isInstinct,
  courage,
  pathName,
  path,
  isExtraBruisable,
  extraBruised,
  bruised,
  hurt,
  injured,
  wounded,
  mauled,
  crippled,
  incapacitated,
  generation,
}: MindType & { generation: number }) => {
  const [localIsExtraBruisable, setLocalIsExtraBruisable] = useState(
    isExtraBruisable
  );
  const [localIsConviction, setLocalIsConviction] = useState(isConviction);
  const [localIsInstinct, setLocalIsInstinct] = useState(isInstinct);
  return (
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
            name="Volonté"
          />
          <SquareLine
            type="Volonté temporaire"
            number={willpower}
            numberChecked={tempWillpower}
          />
          <ColumnTitle>Réserve de Sang</ColumnTitle>
          <SquareLine
            type="Sang"
            number={maxBlood(generation)}
            numberChecked={bloodSpent}
          />
        </div>
        <div>
          <ColumnTitleWithOptions
            title="Vertues"
            options={[
              {
                name: 'Voie avec Conviction',
                value: localIsConviction,
                onClick: () => setLocalIsConviction(!localIsConviction),
              },
              {
                name: 'Voie avec Instinct',
                value: localIsInstinct,
                onClick: () => setLocalIsInstinct(!localIsInstinct),
              },
            ]}
          />
          <Line
            title={localIsConviction ? 'Conviction' : 'Conscience'}
            value={conscience}
            maxLevel={5}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Conscience"
          />
          <Line
            title={localIsInstinct ? 'Instinct' : 'Maitrise de soi'}
            value={selfControl}
            maxLevel={5}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Maitrise de soi"
          />
          <Line
            title="Courage"
            value={courage}
            maxLevel={5}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Courage"
          />
          <ColumnTitle>Voie</ColumnTitle>
          <UnderlinedHandLargeEditableText value={pathName} />
          <Line
            value={path}
            maxLevel={10}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Voie"
          />
        </div>
        <Health
          isExtraBruisable={localIsExtraBruisable}
          changeIsExtraBruisable={() =>
            setLocalIsExtraBruisable(!localIsExtraBruisable)
          }
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
};

export default Mind;
