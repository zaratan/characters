import React, { useContext } from 'react';
import styled from 'styled-components';
import { maxDot } from '../../helpers/maxLevels';
import { HorizontalSection } from '../../styles/Sections';
import ColumnTitleWithOptions from '../ColumnTitleWithOptions';
import DisciplinesContext, {
  TempThaumaturgyElemType,
} from '../../contexts/DisciplinesContext';
import Line from '../line/Line';
import {
  calcPexDiffThaumaturgyPath,
  calcPexDiffInClanDiscipline,
  calcPexDiffOutOfClanDiscipline,
  calcPexDiffThaumaturgyRitual,
  calcPexInClanDiscipline,
  calcPexOutOfClanDiscipline,
  calcPexThaumaturgyPath,
  calcPexThaumaturgyRitual,
} from '../../helpers/pex';
import { HandEditableText, HandText } from '../../styles/Texts';
import GenerationContext from '../../contexts/GenerationContext';
import { Container } from '../../styles/Container';
import SectionTitle from '../SectionTitle';
import ModeContext from '../../contexts/ModeContext';
import SectionsContext from '../../contexts/SectionsContext';
import DataContext from '../../contexts/DataContext';
import LineValue from '../line/LineValue';

const RitualMultiplicatorContainer = styled.span`
  font-size: 1rem;
  white-space: nowrap;
`;

const Disciplines = () => {
  const generation = useContext(GenerationContext);
  const {
    disciplines: disciplineData,
    disciplinesCombi: disciplinesCombiData,
  } = useContext(DataContext);
  const {
    clanDisciplines,
    outClanDisciplines,
    combinedDisciplines,
    addNewClanDiscipline,
    removeClanDiscipline,
    addNewOutClanDiscipline,
    removeOutClanDiscipline,
    addNewCombinedDiscipline,
    removeCombinedDiscipline,
  } = useContext(DisciplinesContext);
  const { editMode } = useContext(ModeContext);
  const { useDisciplines, useGeneration } = useContext(SectionsContext);
  if (!useDisciplines) return null;
  const maxLevel = maxDot(useGeneration ? generation.value : 13);
  return (
    <>
      <SectionTitle
        title="Disciplines"
        pexElems={[
          {
            elemArray: clanDisciplines,
            pexCalc: calcPexInClanDiscipline(maxLevel),
          },
          {
            elemArray: outClanDisciplines,
            pexCalc: calcPexOutOfClanDiscipline(maxLevel),
          },
          {
            elemArray: combinedDisciplines,
            pexCalc: (value) => value,
          },
          {
            elemArray: [...clanDisciplines, ...outClanDisciplines].flatMap(
              (disc) => disc.paths
            ),
            pexCalc: calcPexThaumaturgyPath,
          },
          ...[...clanDisciplines, ...outClanDisciplines].flatMap((disc) => ({
            elemArray: disc.rituals,
            pexCalc: (value) =>
              calcPexThaumaturgyRitual(value, disc.ritualMulti),
          })),
        ]}
      />
      <HorizontalSection>
        <Container>
          <ColumnTitleWithOptions
            title="Clan"
            button={{ glyph: '+', value: addNewClanDiscipline }}
            elemArray={clanDisciplines}
            pexCalc={calcPexInClanDiscipline(maxLevel)}
            inactive={!editMode}
          />
          <ul>
            {clanDisciplines.map((discipline) => (
              <li key={discipline.key}>
                <Line
                  elem={discipline}
                  maxLevel={maxLevel}
                  title={discipline.title}
                  name={discipline.title}
                  diffPexCalc={calcPexDiffInClanDiscipline(maxLevel)}
                  changeName={discipline.setTitle}
                  custom
                  remove={() => removeClanDiscipline(discipline.key)}
                  placeholder="Nom de la discipline"
                  lineAction={{
                    glyph: 'Th',
                    value: discipline.toggleThaumaturgy,
                    active: discipline.isThaumaturgy,
                  }}
                  inactive={!editMode}
                  autocomplete={disciplineData}
                  infoLink={
                    disciplineData.find(
                      (discData) => discData.name === discipline.title
                    )?.url
                  }
                />
              </li>
            ))}
          </ul>
        </Container>
        <Container>
          <ColumnTitleWithOptions
            title="Hors Clan"
            button={{ glyph: '+', value: addNewOutClanDiscipline }}
            elemArray={outClanDisciplines}
            pexCalc={calcPexOutOfClanDiscipline(maxLevel)}
            inactive={!editMode}
          />
          <ul>
            {outClanDisciplines.map((discipline) => (
              <li key={discipline.key}>
                <Line
                  elem={discipline}
                  maxLevel={maxLevel}
                  title={discipline.title}
                  name={discipline.title}
                  diffPexCalc={calcPexDiffOutOfClanDiscipline(maxLevel)}
                  changeName={discipline.setTitle}
                  custom
                  remove={() => removeOutClanDiscipline(discipline.key)}
                  placeholder="Nom de la discipline"
                  lineAction={{
                    glyph: 'Th',
                    value: discipline.toggleThaumaturgy,
                    active: discipline.isThaumaturgy,
                  }}
                  inactive={!editMode}
                  autocomplete={disciplineData}
                  infoLink={
                    disciplineData.find(
                      (discData) => discData.name === discipline.title
                    )?.url
                  }
                />
              </li>
            ))}
          </ul>
        </Container>
        <Container>
          <ColumnTitleWithOptions
            title="Disciplines Combinées"
            button={{ glyph: '+', value: addNewCombinedDiscipline }}
            elemArray={combinedDisciplines}
            pexCalc={(value) => value}
            inactive={!editMode}
          />
          <ul>
            {combinedDisciplines.map((combinedDiscipline) => (
              <li key={combinedDiscipline.key}>
                <LineValue
                  changeName={combinedDiscipline.setTitle}
                  diffPexCalc={(from, to) => to - from}
                  elem={combinedDiscipline}
                  remove={() =>
                    removeCombinedDiscipline(combinedDiscipline.key)
                  }
                  title={combinedDiscipline.title}
                  placeholderName="Nom de la discipline"
                  inactive={!editMode}
                  autocomplete={disciplinesCombiData}
                  infoLink={
                    disciplinesCombiData.find(
                      (discData) => discData.name === combinedDiscipline.title
                    )?.url
                  }
                />
              </li>
            ))}
          </ul>
        </Container>
        {[...clanDisciplines, ...outClanDisciplines]
          .filter((disc) => disc.isThaumaturgy)
          .map((thau: TempThaumaturgyElemType) => [
            <Container key={`${thau.key}-paths`}>
              <ColumnTitleWithOptions
                title={`Voies de ${thau.title}`}
                button={{ glyph: '+', value: thau.addNewPath }}
                elemArray={thau.paths}
                pexCalc={calcPexThaumaturgyPath}
                inactive={!editMode}
              />
              <ul>
                <li>
                  <Line
                    elem={{
                      value: thau.value,
                      baseValue: thau.baseValue,
                      set: () => {},
                    }}
                    maxLevel={5}
                    name={thau.mainPathName}
                    title={thau.mainPathName}
                    diffPexCalc={() => 0}
                    key={thau.key}
                    dotInactive
                    inactive={!editMode}
                    changeName={thau.changeMainPathName}
                    custom
                  />
                </li>
                {thau.paths.map((path) => (
                  <li key={path.key}>
                    <Line
                      elem={path}
                      maxLevel={Math.min(thau.value, 5)}
                      name={path.title}
                      title={path.title}
                      diffPexCalc={calcPexDiffThaumaturgyPath}
                      key={path.key}
                      changeName={path.setTitle}
                      custom
                      remove={() => thau.removePath(path.key)}
                      placeholder="Nom de la voie"
                      inactive={!editMode}
                    />
                  </li>
                ))}
              </ul>
            </Container>,
            <Container key={`${thau.key}-rituals`}>
              <ColumnTitleWithOptions
                title={`Rituels de ${thau.title}`}
                button={{ glyph: '+', value: thau.addNewRitual }}
                elemArray={thau.rituals}
                pexCalc={(value) =>
                  calcPexThaumaturgyRitual(value, thau.ritualMulti)
                }
                inactive={!editMode}
              >
                <RitualMultiplicatorContainer className="ritual-multiplicator">
                  (x
                  {editMode ? (
                    <HandEditableText
                      className="very-small"
                      type="number"
                      min={1}
                      max={3}
                      maxLength={1}
                      value={thau.ritualMulti === 0 ? '' : thau.ritualMulti}
                      onChange={(e) =>
                        thau.setRitualMulti(Number(e.currentTarget.value))
                      }
                    />
                  ) : (
                    <HandText className="very-small">
                      {thau.ritualMulti === 0 ? '' : thau.ritualMulti}
                    </HandText>
                  )}
                  )
                </RitualMultiplicatorContainer>
              </ColumnTitleWithOptions>
              <ul>
                {thau.rituals.map((ritual) => (
                  <li key={ritual.key}>
                    <LineValue
                      changeName={ritual.setTitle}
                      diffPexCalc={(from: number, to: number) =>
                        calcPexDiffThaumaturgyRitual(from, to, thau.ritualMulti)
                      }
                      elem={ritual}
                      title={ritual.title}
                      maxValue={thau.value}
                      remove={() => thau.removeRitual(ritual.key)}
                      placeholderSub="Niv."
                      placeholderName="Nom du Rituel"
                      inactive={!editMode}
                    />
                  </li>
                ))}
              </ul>
            </Container>,
          ])}
      </HorizontalSection>
    </>
  );
};

export default Disciplines;
