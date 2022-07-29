import React, { useContext } from 'react';
import styled from 'styled-components';
import ThemeContext from '../contexts/ThemeContext';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import { darkTheme, lightTheme } from '../styles/Theme';
import { Glyph } from './Glyph';

const SquareContainer = styled.span`
  height: 36px;
  :focus,
  :hover {
    outline: none;
  }
  :not(.inactive) {
    cursor: pointer;
    :hover {
      svg.hover-check {
        path.first,
        path.second {
          stroke-dashoffset: 0 !important;
        }
      }
    }
    :focus,
    :hover {
      outline: none;
      rect {
        stroke: darkcyan;
        stroke-width: 3px;
      }
    }
  }
`;

const SquareStyle = styled.svg`
  width: 24px;
  height: 36px;
  fill: transparent;
  path {
    stroke-dasharray: 33.95, 33.95;
    stroke-dashoffset: 33.95;
  }
  path.first {
    &.checked {
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 0.2s ease-in-out;
    }
  }
  path.second {
    &.checked {
      stroke-dashoffset: 0;
    }
    &.checked:not(.slow-checked) {
      transition: stroke-dashoffset 0.2s ease-in-out;
    }
    &.checked.slow-checked {
      transition: stroke-dashoffset 0.2s ease-in-out 0.2s;
    }
  }
  path.third {
    &.checked {
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 0.2s ease-in-out;
    }
  }
`;

export const EmptyGlyph = ({
  onClick,
  inactive,
  type,
}: {
  onClick: () => void;
  inactive: boolean;
  type: string;
}) => {
  let handleClick = () => {};
  if (!inactive) {
    handleClick = onClick;
  }
  return (
    <Glyph
      name={`Vider ${type}`}
      onClick={handleClick}
      inactive={inactive}
      absolutePosition
      className="empty-glyph"
    >
      ø
    </Glyph>
  );
};

const Square = ({
  checked,
  onClick,
  inactive,
  name,
}: {
  name: string;
  inactive?: boolean;
  checked: boolean | number;
  onClick: () => void;
}) => {
  const timeChecked = checked === true ? 2 : Number(checked);
  const hoverCheck = checked === true || checked === false;
  const handleClick = generateHandleClick(inactive ? () => {} : onClick);
  const handleKeypress = generateHandleKeypress(inactive ? () => {} : onClick);
  const { darkMode } = useContext(ThemeContext);
  return (
    <SquareContainer
      aria-label={name}
      onClick={handleClick}
      onKeyPress={handleKeypress}
      role="button"
      tabIndex={inactive ? -1 : 0}
      className={inactive ? 'inactive' : ''}
    >
      <SquareStyle className={hoverCheck ? 'hover-check' : ''}>
        <rect
          x="3"
          y="9"
          stroke={darkMode ? darkTheme.color : lightTheme.color}
          strokeWidth="2"
          width="18"
          height="18"
        />
        <path
          d="M6 12 L18 24 Z"
          className={`first ${timeChecked >= 1 ? 'checked' : ''}`}
          stroke={darkMode ? darkTheme.color : lightTheme.color}
          strokeWidth="2"
        />
        <path
          d="M18 12 L6 24 Z"
          className={`second ${timeChecked >= 2 ? 'checked' : ''} ${
            hoverCheck ? 'slow-checked' : ''
          }`}
          stroke={darkMode ? darkTheme.color : lightTheme.color}
          strokeWidth="2"
        />
        <path
          d="M12 11 L12 25 Z"
          className={`third ${timeChecked >= 3 ? 'checked' : ''}`}
          stroke={darkMode ? darkTheme.color : lightTheme.color}
          strokeWidth="2"
        />
      </SquareStyle>
    </SquareContainer>
  );
};

export default Square;
