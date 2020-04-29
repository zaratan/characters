import React, { useContext } from 'react';
import { maxDot } from '../helpers/maxLevels';
import InfosContext from '../contexts/InfosContext';
import { StyledLine } from '../styles/Lines';
import { HorizontalSection } from '../styles/Sections';
import ColumnTitleWithOptions from './ColumnTitleWithOptions';
import DisciplinesContext, {
  ThaumaturgyType,
  TempThaumaturgyElemType,
} from '../contexts/DisciplinesContext';
import Line, { LineValue } from './Line';
import Mind from './Mind';
import {
  calcPexDiffThaumaturgyPath,
  calcPexDiffInClanDiscipline,
  calcPexDiffOutOfClanDiscipline,
  calcPexDiffThaumaturgyRitual,
} from '../helpers/pex';

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
        <div>
          <ColumnTitleWithOptions
            title="Clan"
            actions={[
              {
                name: 'Ajouter une discipline de clan',
                value: addNewClanDiscipline,
              },
            ]}
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
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <ColumnTitleWithOptions
            title="Hors Clan"
            actions={[
              {
                name: 'Ajouter une discipline hors clan',
                value: addNewOutClanDiscipline,
              },
            ]}
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
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <ColumnTitleWithOptions
            title="Disciplines Combinées"
            actions={[
              {
                name: 'Ajouter une discipline combinée',
                value: addNewCombinedDiscipline,
              },
            ]}
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
                />
              </li>
            ))}
          </ul>
        </div>
        {[...clanDisciplines, ...outClanDisciplines]
          .filter((disc) => disc.isThaumaturgy)
          .map((thau: TempThaumaturgyElemType) => (
            <>
              <div>
                <ColumnTitleWithOptions
                  title={`Voies de ${thau.title}`}
                  actions={[
                    {
                      name: 'Ajouter une nouvelle Voie',
                      value: thau.addNewPath,
                    },
                  ]}
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
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <ColumnTitleWithOptions
                  title={`Rituels de ${thau.title}`}
                  actions={[
                    {
                      name: 'Ajouter une nouveau Rituel',
                      value: thau.addNewRitual,
                    },
                  ]}
                />
                <ul>
                  {thau.rituals.map((ritual) => (
                    <li key={ritual.key}>
                      <LineValue
                        changeName={ritual.setTitle}
                        diffPexCalc={(from: number, to: number) =>
                          calcPexDiffThaumaturgyRitual(
                            from,
                            to,
                            thau.ritualMulti
                          )
                        }
                        elem={ritual}
                        name={ritual.title}
                        title={ritual.title}
                        maxValue={thau.value}
                        remove={() => thau.removeRitual(ritual.key)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ))}
      </HorizontalSection>
    </>
  );
};

export default Disciplines;
