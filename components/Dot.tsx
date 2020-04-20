import React from 'react';
import styled from 'styled-components';

const DotStyle = styled.svg`
  padding: 0 0.05rem;
  fill: transparent;
  &.full {
    fill: #555;
  }
  width: 24px;
  height: 36px;
  transition: fill 0.2s ease-in-out;
  :hover,
  :hover ~ svg {
    fill: #555 !important;
  }
`;

const TextHelper = styled.small`
  position: absolute;
  top: -6px;
  width: 100%;
  text-align: center;
  font-size: 0.6rem;
  display: none;
  transition: display 0.2s ease-in-out;
`;

const DotContainer = styled.span`
  position: relative;
  height: 36px;
  :hover ~ span {
    svg {
      fill: #555 !important;
    }
  }

  :hover small {
    display: inline;
  }

  :not(.selected) {
    cursor: pointer;
  }

  &.base.selected small {
    display: none;
    color: red;
  }

  &.selected small {
    display: inline;
    color: red;
  }
`;

const Dot = ({
  full,
  selectedValue,
  baseValue,
  pexValue,
  onClick,
}: {
  full?: boolean;
  selectedValue: boolean;
  baseValue: boolean;
  pexValue?: number;
  onClick?: () => void;
}) => {
  const containerClass = `${selectedValue ? 'selected' : ''} ${
    baseValue ? 'base' : ''
  }`;
  return (
    <DotContainer className={containerClass}>
      <TextHelper>{pexValue}</TextHelper>
      <DotStyle onClick={onClick} className={full ? 'full' : 'not-full'}>
        <ellipse
          cx="11"
          cy="18"
          rx="9"
          ry="11"
          stroke="black"
          strokeWidth="2"
        />
      </DotStyle>
    </DotContainer>
  );
};

export default Dot;
