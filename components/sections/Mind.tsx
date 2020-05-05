import React, { useContext } from 'react';
import { HorizontalSection } from '../../styles/Sections';
import Line from '../Line';
import {
  calcPexDiffWillpower,
  calcPexDiffPathOrVirtue,
  calcPexWillpower,
  calcPexPathOrVirtue,
} from '../../helpers/pex';
import SquareLine from '../SquareLine';
import Health from '../Health';
import { maxBlood } from '../../helpers/maxLevels';
import UnderlinedHandLargeEditableText from '../UnderlinedHandLargeEditableText';
import ColumnTitleWithOptions from '../ColumnTitleWithOptions';
import MindContext from '../../contexts/MindContext';
import GenerationContext from '../../contexts/GenerationContext';
import ColumnTitle from '../ColumnTitle';
import SectionTitle from '../SectionTitle';

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
      <SectionTitle
        title="Esprit"
        pexElems={[
          {
            elemArray: [willpower],
            pexCalc: calcPexWillpower,
          },
          {
            elemArray: [courage, selfControl, conscience, path],
            pexCalc: calcPexPathOrVirtue,
          },
        ]}
      />
      <HorizontalSection>
        <div>
          <ColumnTitle
            elemArray={[willpower]}
            pexCalc={calcPexWillpower}
            title="Volonté"
          />
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
            elemArray={[conscience, courage, selfControl]}
            pexCalc={calcPexPathOrVirtue}
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
          <ColumnTitle
            elemArray={[path]}
            pexCalc={calcPexPathOrVirtue}
            title="Voie"
          />
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
