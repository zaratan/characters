import styled from 'styled-components';
import { calcPexDiffAbility, calcPexDiffSpecialty } from '../../helpers/pex';
import { HandEditableText, HandText } from '../../styles/Texts';
import type { TempElemType } from '../../types/TempElemType';
import { Glyph } from '../Glyph';
import ButtonGlyphContainer from './ButtonGlyphContainer';
import Line from './Line';

const SpecialtyContainer = styled.li`
  width: 80%;
  display: flex;
  position: relative;
  @media screen and (max-width: 500px) {
    margin: auto;
  }
`;

const SpecialtiesContainer = styled.ul`
  display: grid;
  position: relative;
  grid-template-columns: repeat(3, 1fr);
`;

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
      <SpecialtiesContainer>
        {specialties &&
          specialties.map((specialty) => (
            <SpecialtyContainer key={specialty.key}>
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
            </SpecialtyContainer>
          ))}
      </SpecialtiesContainer>
    </li>
  </Line>
);

export default AbilityLine;
