// TODO THIS IS A BUG IN ESLINT

import type { HTMLAttributes } from 'react';
import { useContext } from 'react';
import PreferencesContext from '../contexts/PreferencesContext';
import classNames from '../helpers/classNames';
import type { TempElemType } from '../types/TempElemType';

export const PexSpan = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={classNames('text-base pl-[0.3rem] whitespace-nowrap', className)}
    {...props}
  />
);

export const RedSpan = ({ ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span className="text-red-600 dark:text-red-500" {...props} />
);

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
  withPercent,
  hover,
}: {
  currentPex?: number;
  diffPex?: number;
  elemArray?: Array<TempElemType<number>>;
  pexCalc?: (value: number) => number;
  pexElems?: pexElemsType;
  alwaysShow?: boolean;
  hideParentheses?: boolean;
  withSpaces?: boolean;
  withPercent?: boolean;
  hover?: number;
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
    <span className="pex-hover-container">
      <PexSpan
        className={
          hover !== undefined && hover !== calcPex.current ? 'hideHover' : ''
        }
      >
        {hideParentheses ? '' : '('}
        {calcPex.current}
        {withPercent ? '%' : ''}
        {!(calcPex.diff === 0 || calcPex.diff === undefined) ? (
          <RedSpan>
            {withSpaces ? ' ' : ''}
            {calcPex.diff < 0 ? '-' : '+'}
            {withSpaces ? ' ' : ''}
            {Math.abs(calcPex.diff)}
            {withPercent ? '%' : ''}
          </RedSpan>
        ) : null}
        {hideParentheses ? '' : ')'}
      </PexSpan>
      {hover !== undefined && hover !== calcPex.current ? (
        <PexSpan className="showHover">
          <RedSpan>
            {hideParentheses ? '' : '('}
            {hover}
            {withPercent ? '%' : ''}
            {hideParentheses ? '' : ')'}
          </RedSpan>
        </PexSpan>
      ) : null}
    </span>
  ) : null;
};

export default PexElem;
