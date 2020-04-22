import React from 'react';
import styled from 'styled-components';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';

const SquareContainer = styled.span`
  height: 36px;
  cursor: pointer;
  :hover {
    svg.hover-check {
      path.first,
      path.second {
        stroke-dashoffset: 0 !important;
      }
    }
  }
  :focus {
    outline: none;
    rect {
      stroke: darkcyan;
      stroke-width: 3px;
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

const Square = ({
  checked,
  onClick,
}: {
  checked: boolean | number;
  onClick: () => void;
}) => {
  const timeChecked = checked === true ? 2 : Number(checked);
  const hoverCheck = checked === true || checked === false;
  const handleClick = generateHandleClick(onClick);
  const handleKeypress = generateHandleKeypress(onClick);
  return (
    <SquareContainer
      onClick={handleClick}
      onKeyPress={handleKeypress}
      role="button"
      tabIndex={0}
    >
      <SquareStyle className={hoverCheck ? 'hover-check' : ''}>
        <rect
          x="3"
          y="9"
          stroke="black"
          strokeWidth="2"
          width="18"
          height="18"
        />
        <path
          d="M6 12 L18 24 Z"
          className={`first ${timeChecked >= 1 ? 'checked' : ''}`}
          stroke="black"
          strokeWidth="2"
        />
        <path
          d="M18 12 L6 24 Z"
          className={`second ${timeChecked >= 2 ? 'checked' : ''} ${
            hoverCheck ? 'slow-checked' : ''
          }`}
          stroke="black"
          strokeWidth="2"
        />
        <path
          d="M12 11 L12 25 Z"
          className={`third ${timeChecked >= 3 ? 'checked' : ''}`}
          stroke="black"
          strokeWidth="2"
        />
      </SquareStyle>
    </SquareContainer>
  );
};

export default Square;