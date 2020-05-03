import React, { useContext } from 'react';
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
import MindContext from '../contexts/MindContext';
import GenerationContext from '../contexts/GenerationContext';

const Mind = () => {
  const {
    willpower,
    tempWillpower,
    bloodSpent,
    conscience,
    courage,
    isConviction,
    isInstinct,
    path,
    pathName,
    selfControl,
  } = useContext(MindContext);
  const generation = useContext(GenerationContext);
  return (
    <>
      <StyledLine />
      <HorizontalSection>
        <div>
          <ColumnTitle>Volonté</ColumnTitle>
          <Line
            elem={willpower}
            maxLevel={10}
            minLevel={1}
            diffPexCalc={calcPexDiffWillpower}
            name="Volonté"
          />
          <SquareLine
            type="Volonté temporaire"
            number={willpower.value}
            numberChecked={tempWillpower}
          />
          <ColumnTitle>Réserve de Sang</ColumnTitle>
          <SquareLine
            type="Sang"
            number={maxBlood(generation.value)}
            numberChecked={bloodSpent}
          />
        </div>
        <div>
          <ColumnTitleWithOptions
            title="Vertues"
            options={[
              {
                name: 'Voie avec Conviction',
                value: isConviction.value,
                onClick: () => isConviction.set(!isConviction.value),
              },
              {
                name: 'Voie avec Instinct',
                value: isInstinct.value,
                onClick: () => isInstinct.set(!isInstinct.value),
              },
            ]}
          />
          <Line
            title={isConviction.value ? 'Conviction' : 'Conscience'}
            elem={conscience}
            maxLevel={5}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Conscience"
          />
          <Line
            title={isInstinct.value ? 'Instinct' : 'Maitrise de soi'}
            elem={selfControl}
            maxLevel={5}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Maitrise de soi"
          />
          <Line
            title="Courage"
            elem={courage}
            maxLevel={5}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Courage"
          />
          <ColumnTitle>Voie</ColumnTitle>
          <UnderlinedHandLargeEditableText elem={pathName} />
          <Line
            elem={path}
            maxLevel={10}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Voie"
          />
        </div>
        <Health />
      </HorizontalSection>
    </>
  );
};

export default Mind;
