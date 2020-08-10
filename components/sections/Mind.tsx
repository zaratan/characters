import React, { useContext } from 'react';
import { useDebounce } from 'react-use';
import { mutate } from 'swr';
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
import ModeContext from '../../contexts/ModeContext';
import IdContext from '../../contexts/IdContext';
import { fetcher } from '../../helpers/fetcher';
import SystemContext from '../../contexts/SystemContext';
import SectionsContext from '../../contexts/SectionsContext';

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
  const { id } = useContext(IdContext);
  const { appId } = useContext(SystemContext);
  const { editMode, playMode } = useContext(ModeContext);
  const { useBlood, usePath, useGeneration } = useContext(SectionsContext);
  useDebounce(
    async () => {
      if (tempWillpower.value === tempWillpower.baseValue) return;
      await fetcher(`/api/vampires/${id}/update_partial`, {
        method: 'POST',
        body: JSON.stringify({
          mind: { tempWillpower: tempWillpower.value },
          appId,
        }),
      });
      mutate(`/api/vampires/${id}`);
    },
    2000,
    [tempWillpower.value]
  );
  useDebounce(
    async () => {
      if (bloodSpent.value === bloodSpent.baseValue) return;
      await fetcher(`/api/vampires/${id}/update_partial`, {
        method: 'POST',
        body: JSON.stringify({ mind: { bloodSpent: bloodSpent.value }, appId }),
      });
      mutate(`/api/vampires/${id}`);
    },
    2000,
    [bloodSpent.value]
  );
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
            elemArray: [courage, selfControl, conscience],
            pexCalc: calcPexPathOrVirtue,
          },
          ...(usePath
            ? [
                {
                  elemArray: [path],
                  pexCalc: calcPexPathOrVirtue,
                },
              ]
            : []),
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
            inactive={!editMode}
          />
          <SquareLine
            type="Volonté temporaire"
            number={willpower.value}
            numberChecked={tempWillpower}
            inactive={!playMode}
          />
          {useBlood ? (
            <>
              <ColumnTitle>Réserve de Sang</ColumnTitle>
              <SquareLine
                type="Sang"
                number={maxBlood(useGeneration ? generation.value : 13)}
                numberChecked={bloodSpent}
                inactive={!playMode}
              />
            </>
          ) : null}
        </div>
        <div>
          <ColumnTitleWithOptions
            title="Vertues"
            options={
              usePath
                ? [
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
                  ]
                : []
            }
            elemArray={[conscience, courage, selfControl]}
            pexCalc={calcPexPathOrVirtue}
            inactive={!editMode}
          />
          <Line
            title={isConviction.value ? 'Conviction' : 'Conscience'}
            elem={conscience}
            maxLevel={5}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Conscience"
            inactive={!editMode}
          />
          <Line
            title={isInstinct.value ? 'Instinct' : 'Maitrise de soi'}
            elem={selfControl}
            maxLevel={5}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Maitrise de soi"
            inactive={!editMode}
          />
          <Line
            title="Courage"
            elem={courage}
            maxLevel={5}
            minLevel={1}
            diffPexCalc={calcPexDiffPathOrVirtue}
            name="Courage"
            inactive={!editMode}
          />
          {usePath ? (
            <>
              <ColumnTitle
                elemArray={[path]}
                pexCalc={calcPexPathOrVirtue}
                title="Voie"
              />
              <UnderlinedHandLargeEditableText
                elem={pathName}
                inactive={!editMode}
              />
              <Line
                elem={path}
                maxLevel={10}
                minLevel={1}
                diffPexCalc={calcPexDiffPathOrVirtue}
                name="Voie"
                inactive={!editMode}
              />
            </>
          ) : null}
        </div>
        <Health />
      </HorizontalSection>
    </>
  );
};

export default Mind;
