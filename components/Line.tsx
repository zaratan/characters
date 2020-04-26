import React, { useState } from 'react';
import styled from 'styled-components';

import Dot, { EmptyGlyph } from './Dot';
import { calcPexDiffAttribute, calcPexDiffAbility } from '../helpers/pex';
import { SubTitle } from '../styles/Titles';
import { HandEditableText } from '../styles/Texts';
import { BlackLine, EmptyLine } from '../styles/Lines';
import { Glyph } from './Glyph';

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
  value,
  title,
  name,
  maxLevel,
  minLevel = 0,
  diffPexCalc,
  custom,
  changeName,
  remove,
}: {
  value?: number;
  name: string;
  maxLevel: number;
  minLevel?: number;
  title?: string;
  diffPexCalc: (from: number, to: number) => number;
  custom?: boolean;
  changeName?: (newValue: string) => void;
  remove?: () => void;
}) => {
  const [localValue, setValue] = useState(value);
  console.log({ remove });

  const onClickHandle = (val: number) => () => {
    setValue(val);
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
            full={localValue >= 10}
            pexValue={diffPexCalc(value, 10)}
            selectedValue={localValue === 10}
            baseValue={value === 10}
            hidden={maxLevel < 10}
            locked={minLevel > 10}
            value={10}
            name={name}
          />
          <Dot
            onClick={onClickHandle(9)}
            full={localValue >= 9}
            pexValue={diffPexCalc(value, 9)}
            selectedValue={localValue === 9}
            baseValue={value === 9}
            hidden={maxLevel < 9}
            locked={minLevel > 8}
            value={9}
            name={name}
          />
          <Dot
            onClick={onClickHandle(8)}
            full={localValue >= 8}
            pexValue={diffPexCalc(value, 8)}
            selectedValue={localValue === 8}
            baseValue={value === 8}
            hidden={maxLevel < 8}
            locked={minLevel > 7}
            value={8}
            name={name}
          />
          <Dot
            onClick={onClickHandle(7)}
            full={localValue >= 7}
            pexValue={diffPexCalc(value, 7)}
            selectedValue={localValue === 7}
            baseValue={value === 7}
            hidden={maxLevel < 7}
            locked={minLevel > 6}
            value={7}
            name={name}
          />
          <Dot
            onClick={onClickHandle(6)}
            full={localValue >= 6}
            pexValue={diffPexCalc(value, 6)}
            selectedValue={localValue === 6}
            baseValue={value === 6}
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
            full={localValue >= 5}
            pexValue={diffPexCalc(value, 5)}
            selectedValue={localValue === 5}
            baseValue={value === 5}
            locked={minLevel > 4}
            value={5}
            name={name}
          />
          <Dot
            onClick={onClickHandle(4)}
            full={localValue >= 4}
            pexValue={diffPexCalc(value, 4)}
            selectedValue={localValue === 4}
            baseValue={value === 4}
            locked={minLevel > 3}
            value={4}
            name={name}
          />
          <Dot
            onClick={onClickHandle(3)}
            full={localValue >= 3}
            pexValue={diffPexCalc(value, 3)}
            selectedValue={localValue === 3}
            baseValue={value === 3}
            locked={minLevel > 2}
            value={3}
            name={name}
          />
          <Dot
            onClick={onClickHandle(2)}
            full={localValue >= 2}
            pexValue={diffPexCalc(value, 2)}
            selectedValue={localValue === 2}
            baseValue={value === 2}
            locked={minLevel > 1}
            value={2}
            name={name}
          />
          <Dot
            onClick={onClickHandle(1)}
            full={localValue >= 1}
            pexValue={diffPexCalc(value, 1)}
            selectedValue={localValue === 1}
            baseValue={value === 1}
            locked={minLevel > 0}
            value={1}
            name={name}
          />
          {minLevel === 0 ? (
            <EmptyGlyph
              selected={localValue === 0}
              baseValue={value === 0}
              pexValue={diffPexCalc(value, minLevel)}
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
    name={title}
  />
);

export const AbilityLine = ({
  value,
  title,
  maxLevel,
  custom,
  changeTitle,
  remove,
}: {
  value?: number;
  title: string;
  maxLevel: number;
  custom?: boolean;
  changeTitle?: (value: string) => void;
  remove?: () => void;
}) => (
  <Line
    value={value}
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
