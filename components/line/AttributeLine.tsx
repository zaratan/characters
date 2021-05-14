import React from 'react';
import { calcPexDiffAttribute } from '../../helpers/pex';
import { TempElemType } from '../../types/TempElemType';
import Line from './Line';

const AttributeLine = ({
  elem,
  title,
  maxLevel,
  inactive,
}: {
  elem: TempElemType<number>;
  title: string;
  maxLevel: number;
  inactive?: boolean;
}) => (
  <Line
    elem={elem}
    title={title}
    diffPexCalc={calcPexDiffAttribute(maxLevel)}
    maxLevel={maxLevel}
    minLevel={1}
    name={title}
    inactive={inactive}
  />
);

export default AttributeLine;
