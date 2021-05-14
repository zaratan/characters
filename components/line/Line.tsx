import React, { ReactNode, useContext } from 'react';
import styled from 'styled-components';

import Dot, { EmptyGlyph } from '../Dot';
import { Glyph } from '../Glyph';
import { TempElemType } from '../../types/TempElemType';
import PreferencesContext from '../../contexts/PreferencesContext';
import DotSeparator from './DotSeparator';
import LineTitle from './LineTitle';
import ColumnLine from './ColumnLine';
import TextHelper from './TextHelper';
import ButtonGlyphContainer from './ButtonGlyphContainer';

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

interface LineProps<T> {
  elem: TempElemType<number>;
  name: string;
  maxLevel: number;
  minLevel?: number;
  title?: string;
  diffPexCalc: (from: number, to: number) => number;
  custom?: boolean;
  changeName?: (newValue: string) => void;
  remove?: () => void;
  placeholder?: string;
  lineAction?: { glyph: string; value: () => void; active?: boolean };
  children?: ReactNode;
  endNumber?: number;
  inactive?: boolean;
  dotInactive?: boolean;
  autocomplete?: Array<T>;
  infoLink?: string;
}

const Line = <T extends { name: string }>({
  elem,
  title,
  name,
  maxLevel,
  minLevel = 0,
  diffPexCalc,
  custom,
  changeName,
  remove,
  placeholder,
  lineAction,
  children,
  endNumber,
  inactive = false,
  dotInactive = false,
  autocomplete,
  infoLink,
}: LineProps<T>) => {
  const onClickHandle =
    !inactive || !dotInactive
      ? (val: number) => () => {
          elem.set(val);
        }
      : // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => () => {};

  const { showPex } = useContext(PreferencesContext);

  return (
    <ul>
      <ColumnLine>
        <LineTitle
          custom={custom}
          changeName={changeName}
          title={title}
          remove={remove}
          placeholder={placeholder}
          inactive={inactive}
          autocomplete={autocomplete}
          infoLink={infoLink}
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
            inactive={inactive || dotInactive}
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
            inactive={inactive || dotInactive}
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
            inactive={inactive || dotInactive}
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
            inactive={inactive || dotInactive}
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
            inactive={inactive || dotInactive}
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
            hidden={maxLevel < 5}
            locked={minLevel > 4}
            value={5}
            name={name}
            inactive={inactive || dotInactive}
          />
          <Dot
            onClick={onClickHandle(4)}
            full={elem.value >= 4}
            pexValue={diffPexCalc(elem.baseValue, 4)}
            selectedValue={elem.value === 4}
            baseValue={elem.baseValue === 4}
            hidden={maxLevel < 4}
            locked={minLevel > 3}
            value={4}
            name={name}
            inactive={inactive || dotInactive}
          />
          <Dot
            onClick={onClickHandle(3)}
            full={elem.value >= 3}
            pexValue={diffPexCalc(elem.baseValue, 3)}
            selectedValue={elem.value === 3}
            baseValue={elem.baseValue === 3}
            hidden={maxLevel < 3}
            locked={minLevel > 2}
            value={3}
            name={name}
            inactive={inactive || dotInactive}
          />
          <Dot
            onClick={onClickHandle(2)}
            full={elem.value >= 2}
            pexValue={diffPexCalc(elem.baseValue, 2)}
            selectedValue={elem.value === 2}
            baseValue={elem.baseValue === 2}
            hidden={maxLevel < 2}
            locked={minLevel > 1}
            value={2}
            name={name}
            inactive={inactive || dotInactive}
          />
          <Dot
            onClick={onClickHandle(1)}
            full={elem.value >= 1}
            pexValue={diffPexCalc(elem.baseValue, 1)}
            selectedValue={elem.value === 1}
            baseValue={elem.baseValue === 1}
            hidden={maxLevel < 1}
            locked={minLevel > 0}
            value={1}
            name={name}
            inactive={inactive || dotInactive}
          />
          {minLevel === 0 && !inactive && !dotInactive ? (
            <EmptyGlyph
              selected={elem.value === 0}
              baseValue={elem.baseValue === 0}
              pexValue={diffPexCalc(elem.baseValue, minLevel)}
              onClick={onClickHandle(minLevel)}
              name={name}
            />
          ) : null}
        </Value>
        {endNumber !== undefined && showPex && (
          <TextHelper className="closer">{endNumber}</TextHelper>
        )}
        {lineAction && !inactive ? (
          <ButtonGlyphContainer
            className={`line-button ${lineAction.active ? 'active' : ''}`}
          >
            <Glyph name={`Action ${title}`} onClick={lineAction.value}>
              {lineAction.glyph}
            </Glyph>
          </ButtonGlyphContainer>
        ) : null}
      </ColumnLine>
      {children}
    </ul>
  );
};

export default Line;
