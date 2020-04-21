import React, { MouseEvent } from 'react';
import styled from 'styled-components';

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
`;

const SquareStyle = styled.svg`
  width: 24px;
  height: 36px;
  fill: transparent;
  path.first {
    stroke-dasharray: 50.92, 50.92;
    stroke-dashoffset: 50.92;
    &.checked {
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 0.2s ease-in-out;
    }
  }
  path.second {
    stroke-dasharray: 50.92, 50.92;
    stroke-dashoffset: 50.92;
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
    stroke-dasharray: 50.92, 50.92;
    stroke-dashoffset: 50.92;
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
  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    onClick();
    e.currentTarget.blur();
  };
  return (
    <SquareContainer onClick={handleClick}>
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
            hoverCheck ? 'slow-checkded' : ''
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
