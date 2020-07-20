import React, { ReactNode } from 'react';
import { StyledColumnTitle } from '../styles/Titles';
import { TempElemType } from '../types/TempElemType';
import PexElem from './PexElem';

const ColumnTitle = ({
  children,
  currentPex,
  diffPex,
  elemArray,
  pexCalc,
  title,
  pexElems,
}: {
  children?: ReactNode;
  currentPex?: number;
  diffPex?: number;
  elemArray?: Array<TempElemType<number>>;
  pexCalc?: (value: number) => number;
  title?: string;
  pexElems?: Array<{
    elemArray: Array<TempElemType<number>>;
    pexCalc: (value: number) => number;
  }>;
}) => (
  <StyledColumnTitle>
    {title}
    <PexElem
      currentPex={currentPex}
      diffPex={diffPex}
      elemArray={elemArray}
      pexCalc={pexCalc}
      pexElems={pexElems}
    />
    {children}
  </StyledColumnTitle>
);

export default ColumnTitle;
