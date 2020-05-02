import React, { useContext } from 'react';
import styled from 'styled-components';
import { maxDot } from '../helpers/maxLevels';
import InfosContext from '../contexts/InfosContext';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import ColumnTitleWithOptions from './ColumnTitleWithOptions';
import DisciplinesContext, {
  TempThaumaturgyElemType,
} from '../contexts/DisciplinesContext';
import Line, { LineValue } from './Line';
import {
  calcPexDiffThaumaturgyPath,
  calcPexDiffInClanDiscipline,
  calcPexDiffOutOfClanDiscipline,
  calcPexDiffThaumaturgyRitual,
} from '../helpers/pex';
import { HandEditableText } from '../styles/Texts';

const Container = styled.div`
  .col-button {
    font-size: 1.5rem;
    height: 100%;
    display: flex;
    align-items: center;
  }
  @media screen and (any-hover: hover) {
    .empty-glyph,
    .open-glyph,
    .line-button,
    .remove-glyph,
    .ritual-multiplicator,
    .col-button {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }
    :hover,
    :focus-within {
      .empty-glyph,
      .open-glyph,
      .line-button,
      .remove-glyph,
      .ritual-multiplicator,
      .col-button {
        opacity: 1;
      }
    }
  }
`;

const RitualMultiplicatorContainer = styled.span`
  font-size: 1rem;
  white-space: nowrap;
`;

const Disciplines = () => {
  const { generation } = useContext(InfosContext);
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
      <StyledLine title="Disciplines" />
      <HorizontalSection>
        <Container>
          <ColumnTitleWithOptions
            title="Clan"
            button={{ glyph: '+', value: addNewClanDiscipline }}
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
                button={{ glyph: '+', value: thau.addNewRitual }}
              >
                <span>{`Rituels de ${thau.title}`}</span>

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
