import React, { useContext } from 'react';
import SectionsContext from '../../contexts/SectionsContext';
import SectionTitle from '../SectionTitle';
import { HorizontalSection } from '../../styles/Sections';
import { Container } from '../../styles/Container';
import HumanMagicContext from '../../contexts/HumanMagicContext';
import {
  calcPexHumanMagic,
  calcPexThaumaturgyRitual,
  calcPexDiffHumanMagic,
  calcPexDiffThaumaturgyRitual,
} from '../../helpers/pex';
import ColumnTitleWithOptions from '../ColumnTitleWithOptions';
import ModeContext from '../../contexts/ModeContext';
import Line, { LineValue } from '../Line';

const HumanMagic = () => {
  const { useHumanMagic } = useContext(SectionsContext);
  const {
    psy,
    addNewPsy,
    removePsy,
    staticMagic,
    addNewStatic,
    removeStatic,
    theurgy,
    addNewTheurgy,
    removeTheurgy,
  } = useContext(HumanMagicContext);
  const { editMode } = useContext(ModeContext);

  if (!useHumanMagic) return null;
  return (
    <>
      <SectionTitle
        title="Magie Humaine"
        pexElems={[
          {
            elemArray: [...psy, ...staticMagic, ...theurgy],
            pexCalc: calcPexHumanMagic,
          },
          ...[...psy, ...staticMagic, ...theurgy].flatMap((power) => ({
            elemArray: power.rituals,
            pexCalc: (value: number) => calcPexThaumaturgyRitual(value, 3),
          })),
        ]}
      />
      <HorizontalSection>
        <Container>
          <ColumnTitleWithOptions
            title="Pouvoirs Psy"
            button={{ glyph: '+', value: addNewPsy }}
            elemArray={psy}
            pexCalc={calcPexHumanMagic}
            inactive={!editMode}
          />
          <ul>
            {psy.map((power) => (
              <li key={power.key}>
                <Line
                  elem={power}
                  maxLevel={5}
                  title={power.title}
                  name={power.title}
                  diffPexCalc={calcPexDiffHumanMagic}
                  changeName={power.setTitle}
                  custom
                  remove={() => removePsy(power.key)}
                  placeholder="Nom du pouvoir"
                  lineAction={{
                    glyph: 'Rt',
                    value: power.toggleRituals,
                    active: power.hasRitual,
                  }}
                  inactive={!editMode}
                />
              </li>
            ))}
          </ul>
        </Container>
        <Container>
          <ColumnTitleWithOptions
            title="Magie Statique"
            button={{ glyph: '+', value: addNewStatic }}
            elemArray={staticMagic}
            pexCalc={calcPexHumanMagic}
            inactive={!editMode}
          />
          <ul>
            {staticMagic.map((power) => (
              <li key={power.key}>
                <Line
                  elem={power}
                  maxLevel={5}
                  title={power.title}
                  name={power.title}
                  diffPexCalc={calcPexDiffHumanMagic}
                  changeName={power.setTitle}
                  custom
                  remove={() => removeStatic(power.key)}
                  placeholder="Nom du pouvoir"
                  lineAction={{
                    glyph: 'Rt',
                    value: power.toggleRituals,
                    active: power.hasRitual,
                  }}
                  inactive={!editMode}
                />
              </li>
            ))}
          </ul>
        </Container>
        <Container>
          <ColumnTitleWithOptions
            title="Théurgie"
            button={{ glyph: '+', value: addNewTheurgy }}
            elemArray={theurgy}
            pexCalc={calcPexHumanMagic}
            inactive={!editMode}
          />
          <ul>
            {theurgy.map((power) => (
              <li key={power.key}>
                <Line
                  elem={power}
                  maxLevel={5}
                  title={power.title}
                  name={power.title}
                  diffPexCalc={calcPexDiffHumanMagic}
                  changeName={power.setTitle}
                  custom
                  remove={() => removeTheurgy(power.key)}
                  placeholder="Nom du pouvoir"
                  lineAction={{
                    glyph: 'Rt',
                    value: power.toggleRituals,
                    active: power.hasRitual,
                  }}
                  inactive={!editMode}
                />
              </li>
            ))}
          </ul>
        </Container>
        {[...psy, ...staticMagic, ...theurgy]
          .filter((power) => power.hasRitual)
          .map((power) => (
            <Container key={`${power.key}-rituals`}>
              <ColumnTitleWithOptions
                title={`Rituels de ${power.title}`}
                button={{ glyph: '+', value: power.addNewRitual }}
                elemArray={power.rituals}
                pexCalc={(value: number) => calcPexThaumaturgyRitual(value, 3)}
                inactive={!editMode}
              />
              <ul>
                {power.rituals.map((ritual) => (
                  <li key={ritual.key}>
                    <LineValue
                      changeName={ritual.setTitle}
                      diffPexCalc={(from: number, to: number) =>
                        calcPexDiffThaumaturgyRitual(from, to, 3)
                      }
                      elem={ritual}
                      title={ritual.title}
                      maxValue={power.value}
                      remove={() => power.removeRitual(ritual.key)}
                      placeholderSub="Niv."
                      placeholderName="Nom du Rituel"
                      inactive={!editMode}
                    />
                  </li>
                ))}
              </ul>
            </Container>
          ))}
      </HorizontalSection>
    </>
  );
};

export default HumanMagic;
