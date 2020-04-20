import React, { useState } from 'react';
import styled from 'styled-components';

import Dot, { EmptyGlyph } from './Dot';
import { calcPexDiffAttribute, calcPexDiffAbility } from '../helpers/pex';

const ColumnLine = styled.li`
  display: flex;
  justify-content: space-between;
`;

const SubTitle = styled.h2`
  font-family: CloisterBlack;
  color: gray;
  display: inline;
  white-space: nowrap;
`;

const Value = styled.span`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;

  :hover svg {
    fill: transparent;
  }
`;

const DotSeparator = styled.span`
  padding: 0.3rem;
  height: 100%;

  :hover ~ span {
    svg {
      fill: #555 !important;
    }
  }

  :hover + span {
    small {
      display: inline;
    }
  }

  :hover svg.full {
    fill: transparent;
  }
  svg.full {
    color: #555;
  }
`;

const Line = ({
  value,
  title,
  maxLevel,
  minLevel = 0,
  diffPexCalc,
}: {
  value?: number;
  maxLevel: number;
  minLevel?: number;
  title: string;
  diffPexCalc: (from: number, to: number) => number;
}) => {
  const [localValue, setValue] = useState(value);

  const onClickHandle = (val: number) => () => {
    setValue(val);
  };

  return (
    <ul>
      <ColumnLine>
        <SubTitle>{title}</SubTitle>
        <DotSeparator />
        <Value>
          <Dot
            onClick={onClickHandle(10)}
            full={localValue >= 10}
            pexValue={diffPexCalc(value, 10)}
            selectedValue={localValue === 10}
            baseValue={value === 10}
            hidden={maxLevel < 10}
            locked={minLevel > 10}
          />
          <Dot
            onClick={onClickHandle(9)}
            full={localValue >= 9}
            pexValue={diffPexCalc(value, 9)}
            selectedValue={localValue === 9}
            baseValue={value === 9}
            hidden={maxLevel < 9}
            locked={minLevel > 8}
          />
          <Dot
            onClick={onClickHandle(8)}
            full={localValue >= 8}
            pexValue={diffPexCalc(value, 8)}
            selectedValue={localValue === 8}
            baseValue={value === 8}
            hidden={maxLevel < 8}
            locked={minLevel > 7}
          />
          <Dot
            onClick={onClickHandle(7)}
            full={localValue >= 7}
            pexValue={diffPexCalc(value, 7)}
            selectedValue={localValue === 7}
            baseValue={value === 7}
            hidden={maxLevel < 7}
            locked={minLevel > 6}
          />
          <Dot
            onClick={onClickHandle(6)}
            full={localValue >= 6}
            pexValue={diffPexCalc(value, 6)}
            selectedValue={localValue === 6}
            baseValue={value === 6}
            hidden={maxLevel < 6}
            locked={minLevel > 5}
          />
          <DotSeparator onClick={onClickHandle(5)} />
          <Dot
            onClick={onClickHandle(5)}
            full={localValue >= 5}
            pexValue={diffPexCalc(value, 5)}
            selectedValue={localValue === 5}
            baseValue={value === 5}
            locked={minLevel > 4}
          />
          <Dot
            onClick={onClickHandle(4)}
            full={localValue >= 4}
            pexValue={diffPexCalc(value, 4)}
            selectedValue={localValue === 4}
            baseValue={value === 4}
            locked={minLevel > 3}
          />
          <Dot
            onClick={onClickHandle(3)}
            full={localValue >= 3}
            pexValue={diffPexCalc(value, 3)}
            selectedValue={localValue === 3}
            baseValue={value === 3}
            locked={minLevel > 2}
          />
          <Dot
            onClick={onClickHandle(2)}
            full={localValue >= 2}
            pexValue={diffPexCalc(value, 2)}
            selectedValue={localValue === 2}
            baseValue={value === 2}
            locked={minLevel > 1}
          />
          <Dot
            onClick={onClickHandle(1)}
            full={localValue >= 1}
            pexValue={diffPexCalc(value, 1)}
            selectedValue={localValue === 1}
            baseValue={value === 1}
            locked={minLevel > 0}
          />
          <EmptyGlyph
            selected={localValue === 0}
            baseValue={value === 0}
            pexValue={diffPexCalc(value, minLevel)}
            onClick={onClickHandle(minLevel)}
          />
        </Value>
      </ColumnLine>
    </ul>
  );
};

export const AttributeLine = ({
  value,
  title,
  maxLevel,
}: {
  value?: number;
  title: string;
  maxLevel: number;
}) => (
  <Line
    value={value}
    title={title}
    diffPexCalc={calcPexDiffAttribute}
    maxLevel={maxLevel}
    minLevel={1}
  />
);

export const AbilityLine = ({
  value,
  title,
  maxLevel,
}: {
  value?: number;
  title: string;
  maxLevel: number;
}) => (
  <Line
    value={value}
    title={title}
    diffPexCalc={calcPexDiffAbility}
    maxLevel={maxLevel}
  />
);

export default Line;
