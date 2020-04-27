import React from 'react';
import styled from 'styled-components';

import Dot, { EmptyGlyph } from './Dot';
import { calcPexDiffAttribute, calcPexDiffAbility } from '../helpers/pex';
import { SubTitle } from '../styles/Titles';
import { HandEditableText } from '../styles/Texts';
import { BlackLine } from '../styles/Lines';
import { Glyph } from './Glyph';
import { TempElemType } from '../types/TempElemType';

const ColumnLine = styled.li`
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 500px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Value = styled.span`
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;

  &.only-dots {
    width: 100%;
    justify-self: center;
  }

  :hover svg {
    fill: transparent;
  }
`;

const DotSeparator = styled.span`
  padding: 0.3rem;
  height: 100%;
  outline: none;

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

  :hover,
  :focus {
    svg.full {
      fill: transparent;
    }
  }

  svg.full {
    color: #555;
  }

  &.hidden {
    display: none;
  }
`;

const CustomTitleContainer = styled.span`
  display: flex;
  :hover,
  :focus {
    .remove-glyph {
      display: inherit;
    }
  }
`;

const RemoveContainer = styled.span`
  display: none;
  position: absolute;
  right: 0;
  top: 4px;
  z-index: 1;
`;
const CustomTitle = styled.span`
  position: relative;
  input {
    text-indent: 1px;
  }
  @media screen and (max-width: 500px) {
    input {
      text-align: center;
      padding: 0;
      text-indent: 0;
    }
  }
`;

const LineTitle = ({
  custom,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  changeName = () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  remove = () => {},
  title,
}: {
  custom?: boolean;
  changeName?: (newValue: string) => void;
  remove?: () => void;
  title?: string;
}) => {
  if (title === undefined) return null;
  return custom ? (
    <CustomTitleContainer>
      <CustomTitle>
        <HandEditableText
          value={title}
          onChange={(e) => changeName(e.currentTarget.value)}
          placeholder="Nouveau Nom…"
        />
        <RemoveContainer className="remove-glyph">
          <Glyph onClick={remove} name={`Remove ${title}`}>
            ✘
          </Glyph>
        </RemoveContainer>
        <BlackLine className="thin" />
      </CustomTitle>
      <DotSeparator />
    </CustomTitleContainer>
  ) : (
    <span>
      <SubTitle>{title}</SubTitle>
      <DotSeparator />
    </span>
  );
};

const Line = ({
  elem,
  title,
  name,
  maxLevel,
  minLevel = 0,
  diffPexCalc,
  custom,
  changeName,
  remove,
}: {
  elem: TempElemType<number>;
  name: string;
  maxLevel: number;
  minLevel?: number;
  title?: string;
  diffPexCalc: (from: number, to: number) => number;
  custom?: boolean;
  changeName?: (newValue: string) => void;
  remove?: () => void;
}) => {
  console.log({ elem });

  const onClickHandle = (val: number) => () => {
    elem.set(val);
  };

  return (
    <ul>
      <ColumnLine>
        <LineTitle
          custom={custom}
          changeName={changeName}
          title={title}
          remove={remove}
        />
        <Value role="radiogroup" className={title || custom ? '' : 'only-dots'}>
          <Dot
            onClick={onClickHandle(10)}
            full={elem.value >= 10}
            pexValue={diffPexCalc(elem.baseValue, 10)}
            selectedValue={elem.value === 10}
            baseValue={elem.baseValue === 10}
            hidden={maxLevel < 10}
            locked={minLevel > 10}
            value={10}
            name={name}
          />
          <Dot
            onClick={onClickHandle(9)}
            full={elem.value >= 9}
            pexValue={diffPexCalc(elem.baseValue, 9)}
            selectedValue={elem.value === 9}
            baseValue={elem.baseValue === 9}
            hidden={maxLevel < 9}
            locked={minLevel > 8}
            value={9}
            name={name}
          />
          <Dot
            onClick={onClickHandle(8)}
            full={elem.value >= 8}
            pexValue={diffPexCalc(elem.baseValue, 8)}
            selectedValue={elem.value === 8}
            baseValue={elem.baseValue === 8}
            hidden={maxLevel < 8}
            locked={minLevel > 7}
            value={8}
            name={name}
          />
          <Dot
            onClick={onClickHandle(7)}
            full={elem.value >= 7}
            pexValue={diffPexCalc(elem.baseValue, 7)}
            selectedValue={elem.value === 7}
            baseValue={elem.baseValue === 7}
            hidden={maxLevel < 7}
            locked={minLevel > 6}
            value={7}
            name={name}
          />
          <Dot
            onClick={onClickHandle(6)}
            full={elem.value >= 6}
            pexValue={diffPexCalc(elem.baseValue, 6)}
            selectedValue={elem.value === 6}
            baseValue={elem.baseValue === 6}
            hidden={maxLevel < 6}
            locked={minLevel > 5}
            value={6}
            name={name}
          />
          <DotSeparator
            onClick={onClickHandle(5)}
            onKeyPress={onClickHandle(5)}
            tabIndex={-1}
            aria-label={`${name} dot separator`}
            role="button"
            className={maxLevel < 6 ? 'hidden' : ''}
          />
          <Dot
            onClick={onClickHandle(5)}
            full={elem.value >= 5}
            pexValue={diffPexCalc(elem.baseValue, 5)}
            selectedValue={elem.value === 5}
            baseValue={elem.baseValue === 5}
            locked={minLevel > 4}
            value={5}
            name={name}
          />
          <Dot
            onClick={onClickHandle(4)}
            full={elem.value >= 4}
            pexValue={diffPexCalc(elem.baseValue, 4)}
            selectedValue={elem.value === 4}
            baseValue={elem.baseValue === 4}
            locked={minLevel > 3}
            value={4}
            name={name}
          />
          <Dot
            onClick={onClickHandle(3)}
            full={elem.value >= 3}
            pexValue={diffPexCalc(elem.baseValue, 3)}
            selectedValue={elem.value === 3}
            baseValue={elem.baseValue === 3}
            locked={minLevel > 2}
            value={3}
            name={name}
          />
          <Dot
            onClick={onClickHandle(2)}
            full={elem.value >= 2}
            pexValue={diffPexCalc(elem.baseValue, 2)}
            selectedValue={elem.value === 2}
            baseValue={elem.baseValue === 2}
            locked={minLevel > 1}
            value={2}
            name={name}
          />
          <Dot
            onClick={onClickHandle(1)}
            full={elem.value >= 1}
            pexValue={diffPexCalc(elem.baseValue, 1)}
            selectedValue={elem.value === 1}
            baseValue={elem.baseValue === 1}
            locked={minLevel > 0}
            value={1}
            name={name}
          />
          {minLevel === 0 ? (
            <EmptyGlyph
              selected={elem.value === 0}
              baseValue={elem.baseValue === 0}
              pexValue={diffPexCalc(elem.baseValue, minLevel)}
              onClick={onClickHandle(minLevel)}
              name={name}
            />
          ) : null}
        </Value>
      </ColumnLine>
    </ul>
  );
};

export const AttributeLine = ({
  elem,
  title,
  maxLevel,
}: {
  elem: TempElemType<number>;
  title: string;
  maxLevel: number;
}) => (
  <Line
    elem={elem}
    title={title}
    diffPexCalc={calcPexDiffAttribute}
    maxLevel={maxLevel}
    minLevel={1}
    name={title}
  />
);

export const AbilityLine = ({
  elem,
  title,
  maxLevel,
  custom,
  changeTitle,
  remove,
}: {
  elem: TempElemType<number>;
  title: string;
  maxLevel: number;
  custom?: boolean;
  changeTitle?: (value: string) => void;
  remove?: () => void;
}) => (
  <Line
    elem={elem}
    title={title}
    diffPexCalc={calcPexDiffAbility}
    maxLevel={maxLevel}
    name={title}
    custom={custom}
    changeName={changeTitle}
    remove={remove}
  />
);

export default Line;
