// TODO THIS IS A BUG IN ESLINT
/* eslint-disable react/prop-types */
import React, { useContext } from 'react';
import styled from 'styled-components';
import PreferencesContext from '../contexts/PreferencesContext';
import { TempElemType } from '../types/TempElemType';

export const PexSpan = styled.span`
  font-size: 1rem;
  padding-left: 0.3rem;
  white-space: nowrap;
`;

export const RedSpan = styled.span`
  color: red;
`;

export const computePexElems = (
  pexElems: Array<{
    elemArray: Array<TempElemType<number>>;
    pexCalc: (value: number) => number;
  }>
) =>
  pexElems.reduce<{ current: number; diff: number }>(
    (totals, pexElem) => {
      const tmpValue = pexElem.elemArray.reduce<{
        current: number;
        diff: number;
      }>(
        (total, elem) => ({
          current: total.current + pexElem.pexCalc(elem.baseValue),
          diff:
            total.diff +
            pexElem.pexCalc(elem.value) -
            pexElem.pexCalc(elem.baseValue),
        }),
        { current: 0, diff: 0 }
      );
      return {
        current: totals.current + tmpValue.current,
        diff: totals.diff + tmpValue.diff,
      };
    },
    { current: 0, diff: 0 }
  );

export type pexElemsType = Array<{
  elemArray: Array<TempElemType<number>>;
  pexCalc: (value: number) => number;
}>;

const PexElem = ({
  currentPex,
  diffPex,
  elemArray,
  pexCalc,
  pexElems,
  alwaysShow,
  hideParentheses,
  withSpaces,
}: {
  currentPex?: number;
  diffPex?: number;
  elemArray?: Array<TempElemType<number>>;
  pexCalc?: (value: number) => number;
  pexElems?: pexElemsType;
  alwaysShow?: boolean;
  hideParentheses?: boolean;
  withSpaces?: boolean;
}) => {
  const { showPex } = useContext(PreferencesContext);
  let calcPex = { current: currentPex, diff: diffPex };
  if ((showPex || alwaysShow) && elemArray && pexCalc) {
    calcPex = elemArray.reduce<{ current: number; diff: number }>(
      (total, elem) => ({
        current: total.current + pexCalc(elem.baseValue),
        diff: total.diff + pexCalc(elem.value) - pexCalc(elem.baseValue),
      }),
      { current: 0, diff: 0 }
    );
  }
  if ((showPex || alwaysShow) && pexElems) {
    calcPex = computePexElems(pexElems);
  }
  return (showPex || alwaysShow) &&
    (calcPex.current !== undefined || calcPex.diff !== undefined) ? (
    <PexSpan>
      {hideParentheses ? '' : '('}
      {calcPex.current}
      {!(calcPex.diff === 0 || calcPex.diff === undefined) ? (
        <RedSpan>
          {withSpaces ? ' ' : ''}
          {calcPex.diff < 0 ? '-' : '+'}
          {withSpaces ? ' ' : ''}
          {Math.abs(calcPex.diff)}
        </RedSpan>
      ) : null}
      {hideParentheses ? '' : ')'}
    </PexSpan>
  ) : null;
};

export default PexElem;
