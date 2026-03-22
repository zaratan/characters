import { calcPexDiffAbility, calcPexDiffSpecialty } from '../../helpers/pex';
import { HandEditableText, HandText } from '../../styles/Texts';
import type { TempElemType } from '../../types/TempElemType';
import { Glyph } from '../Glyph';
import ButtonGlyphContainer from './ButtonGlyphContainer';
import Line from './Line';

const AbilityLine = ({
  elem,
  title,
  maxLevel,
  custom,
  changeTitle,
  remove,
  lineAction,
  baseSpecialtyCount,
  specialties,
  removeSpecialty,
  changeSpecialtyTitle,
  inactive,
}: {
  elem: TempElemType<number>;
  title: string;
  maxLevel: number;
  custom?: boolean;
  changeTitle?: (value: string) => void;
  remove?: () => void;
  lineAction?: { glyph: string; value: () => void };
  baseSpecialtyCount: number;
  specialties?: Array<{ key: string; name: string }>;
  removeSpecialty?: (key: string) => void;
  changeSpecialtyTitle?: (key: string, newTitle: string) => void;
  inactive?: boolean;
}) => (
  <Line
    elem={elem}
    title={title}
    diffPexCalc={calcPexDiffAbility(maxLevel)}
    maxLevel={maxLevel}
    name={title}
    custom={custom}
    changeName={changeTitle}
    remove={remove}
    lineAction={lineAction}
    endNumber={
      ((specialties && specialties.length) || 0) !== baseSpecialtyCount
        ? calcPexDiffSpecialty(
            baseSpecialtyCount,
            (specialties && specialties.length) || 0
          )
        : undefined
    }
    inactive={inactive}
  >
    <li>
      <ul className="grid relative grid-cols-3">
        {specialties &&
          specialties.map((specialty) => (
            <li
              key={specialty.key}
              className="w-4/5 flex relative max-md:mx-auto"
            >
              {inactive ? (
                <HandText>{specialty.name}</HandText>
              ) : (
                <HandEditableText
                  className="low"
                  value={specialty.name}
                  onChange={(e) => {
                    changeSpecialtyTitle!(specialty.key, e.currentTarget.value);
                  }}
                />
              )}
              {inactive ? null : (
                <ButtonGlyphContainer className="remove-spec-button no-reposition">
                  <Glyph
                    name={`remove-${specialty.name}`}
                    onClick={() => removeSpecialty!(specialty.key)}
                  >
                    ✘
                  </Glyph>
                </ButtonGlyphContainer>
              )}
            </li>
          ))}
      </ul>
    </li>
  </Line>
);

export default AbilityLine;
