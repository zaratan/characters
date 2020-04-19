import React, { useState } from 'react';
import styled from 'styled-components';

import Dot from './Dot';
import { calcPexDiffAttribute, calcPexDiffCapacity } from '../helpers/pex';

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

  :hover ~ svg {
    fill: #555 !important;
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
  diffPexCalc,
}: {
  value?: number;
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
            onClick={onClickHandle(9)}
            full={localValue >= 9}
            pexValue={diffPexCalc(value, 9)}
          />
          <Dot
            onClick={onClickHandle(8)}
            full={localValue >= 8}
            pexValue={diffPexCalc(value, 8)}
          />
          <Dot
            onClick={onClickHandle(7)}
            full={localValue >= 7}
            pexValue={diffPexCalc(value, 7)}
          />
          <Dot
            onClick={onClickHandle(6)}
            full={localValue >= 6}
            pexValue={diffPexCalc(value, 6)}
          />
          <DotSeparator />
          <Dot
            onClick={onClickHandle(5)}
            full={localValue >= 5}
            pexValue={diffPexCalc(value, 5)}
          />
          <Dot
            onClick={onClickHandle(4)}
            full={localValue >= 4}
            pexValue={diffPexCalc(value, 4)}
          />
          <Dot
            onClick={onClickHandle(3)}
            full={localValue >= 3}
            pexValue={diffPexCalc(value, 3)}
          />
          <Dot
            onClick={onClickHandle(2)}
            full={localValue >= 2}
            pexValue={diffPexCalc(value, 2)}
          />
          <Dot
            onClick={onClickHandle(1)}
            full={localValue >= 1}
            pexValue={diffPexCalc(value, 1)}
          />
        </Value>
      </ColumnLine>
    </ul>
  );
};

export const AttributeLine = ({
  value,
  title,
}: {
  value?: number;
  title: string;
}) => <Line value={value} title={title} diffPexCalc={calcPexDiffAttribute} />;

export const CapacityLine = ({
  value,
  title,
}: {
  value?: number;
  title: string;
}) => <Line value={value} title={title} diffPexCalc={calcPexDiffCapacity} />;

export default Line;
