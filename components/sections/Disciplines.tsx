import React, { useContext } from 'react';
import styled from 'styled-components';
import { maxDot } from '../../helpers/maxLevels';
import { HorizontalSection } from '../../styles/Sections';
import ColumnTitleWithOptions from '../ColumnTitleWithOptions';
import DisciplinesContext, {
  TempThaumaturgyElemType,
} from '../../contexts/DisciplinesContext';
import Line, { LineValue } from '../Line';
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
import { HandEditableText } from '../../styles/Texts';
import GenerationContext from '../../contexts/GenerationContext';
import { Container } from '../../styles/Container';
import SectionTitle from '../SectionTitle';

const RitualMultiplicatorContainer = styled.span`
  font-size: 1rem;
  white-space: nowrap;
`;

const Disciplines = () => {
  const generation = useContext(GenerationContext);
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
  const maxLevel = maxDot(generation.value);
  return (
    <>
      <SectionTitle
        title="Disciplines"
        pexElems={[
          {
            elemArray: clanDisciplines,
            pexCalc: calcPexInClanDiscipline,
          },
          {
            elemArray: outClanDisciplines,
            pexCalc: calcPexOutOfClanDiscipline,
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
            pexCalc={calcPexInClanDiscipline}
          />
          <ul>
            {clanDisciplines.map((discipline) => (
              <li key={discipline.key}>
                <Line
                  elem={discipline}
                  maxLevel={maxLevel}
                  title={discipline.title}
                  name={discipline.title}
                  diffPexCalc={calcPexDiffInClanDiscipline}
                  changeName={discipline.setTitle}
                  custom
                  remove={() => removeClanDiscipline(discipline.key)}
                  placeholder="Nom de la discipline"
                  lineAction={{
                    glyph: 'Th',
                    value: discipline.toggleThaumaturgy,
                    active: discipline.isThaumaturgy,
                  }}
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
            pexCalc={calcPexOutOfClanDiscipline}
          />
          <ul>
            {outClanDisciplines.map((discipline) => (
              <li key={discipline.key}>
                <Line
                  elem={discipline}
                  maxLevel={maxLevel}
                  title={discipline.title}
                  name={discipline.title}
                  diffPexCalc={calcPexDiffOutOfClanDiscipline}
                  changeName={discipline.setTitle}
                  custom
                  remove={() => removeOutClanDiscipline(discipline.key)}
                  placeholder="Nom de la discipline"
                  lineAction={{
                    glyph: 'Th',
                    value: discipline.toggleThaumaturgy,
                    active: discipline.isThaumaturgy,
                  }}
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
          />
          <ul>
            {combinedDisciplines.map((combinedDiscipline) => (
              <li key={combinedDiscipline.key}>
                <LineValue
                  changeName={combinedDiscipline.setTitle}
                  diffPexCalc={(from, to) => to - from}
                  elem={combinedDiscipline}
                  name={combinedDiscipline.title}
                  remove={() =>
                    removeCombinedDiscipline(combinedDiscipline.key)
                  }
                  title={combinedDiscipline.title}
                  placeholderName="Nom de la discipline"
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
              />
              <ul>
                <li>
                  <Line
                    elem={{
                      value: thau.value,
                      baseValue: thau.baseValue,
                      // eslint-disable-next-line @typescript-eslint/no-empty-function
                      set: () => {},
                    }}
                    maxLevel={5}
                    name={thau.mainPathName}
                    title={thau.mainPathName}
                    diffPexCalc={() => 0}
                    key={thau.key}
                    interactive={false}
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
              >
                <RitualMultiplicatorContainer className="ritual-multiplicator">
                  (x
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
                      name={ritual.title}
                      title={ritual.title}
                      maxValue={thau.value}
                      remove={() => thau.removeRitual(ritual.key)}
                      placeholderSub="Niv."
                      placeholderName="Nom du Rituel"
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
