import React, { useContext } from 'react';
import styled from 'styled-components';
import PreferencesContext from '../../contexts/PreferencesContext';
import { HandText, HandEditableText } from '../../styles/Texts';
import { TempElemType } from '../../types/TempElemType';
import ColumnLine from './ColumnLine';
import LineTitle from './LineTitle';
import TextHelper from './TextHelper';

const TextContainer = styled.div`
  position: relative;
  &.inactive {
    display: flex;
    justify-content: center;
  }
`;

const LineValue = ({
  elem,
  title,
  maxValue,
  diffPexCalc,
  changeName,
  remove,
  placeholderName,
  placeholderSub,
  full,
  inactive,
}: {
  elem?: TempElemType<number>;
  maxValue?: number;
  title: string;
  diffPexCalc: (from: number, to: number) => number;
  changeName: (newValue: string) => void;
  remove: () => void;
  placeholderName?: string;
  placeholderSub?: string;
  full?: boolean;
  inactive?: boolean;
}) => {
  const { showPex } = useContext(PreferencesContext);
  return (
    <ul>
      <ColumnLine>
        <LineTitle
          custom
          changeName={changeName}
          title={title}
          remove={remove}
          placeholder={placeholderName || 'Nouveau nom…'}
          full={full}
          inactive={inactive}
        />
        {elem ? (
          <TextContainer className={inactive ? 'inactive' : ''}>
            {inactive ? (
              <HandText className="small">
                {elem.value === 0 ? '' : elem.value}
              </HandText>
            ) : (
              <HandEditableText
                size={3}
                maxLength={3}
                value={elem.value === 0 ? '' : elem.value}
                onChange={(e) => elem.set(Number(e.currentTarget.value))}
                type="number"
                max={maxValue}
                min={0}
                className="small"
                placeholder={placeholderSub || 'XP'}
              />
            )}
            {elem.baseValue !== elem.value && showPex ? (
              <TextHelper>{diffPexCalc(elem.baseValue, elem.value)}</TextHelper>
            ) : null}
          </TextContainer>
        ) : null}
      </ColumnLine>
    </ul>
  );
};

export default LineValue;
