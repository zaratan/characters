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
  :hover {
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

const EmptyGlyphText = styled.span`
  font-size: 21px;
  padding-right: 2px;
  cursor: pointer;
`;

const DotContainer = styled.span`
  position: relative;
  height: 36px;
  :hover ~ span {
    svg {
      fill: #555 !important;
    }
  }

  &.locked svg {
    fill: #555 !important;
  }

  :hover small {
    display: inline;
  }

  :not(.selected):not(.locked) {
    cursor: pointer;
  }

  &.base.selected,
  &.locked {
    small {
      display: none;
      color: red;
    }
  }

  &.selected small {
    display: inline;
    color: red;
  }

  &.hidden {
    display: none;
  }
`;

const GlyphContainer = styled.span`
  position: relative;
  :hover small {
    display: inline;
  }
  &.base.selected {
    small {
      display: none;
      color: red;
    }
  }
  &.selected small {
    display: inline;
    color: red;
  }
`;

export const EmptyGlyph = ({
  pexValue,
  onClick,
  selected,
  baseValue,
}: {
  selected: boolean;
  pexValue: number;
  baseValue: boolean;
  onClick: () => void;
}) => {
  const containerClass = `
    ${selected ? 'selected' : ''} 
    ${baseValue ? 'base' : ''} 
  `;
  return (
    <GlyphContainer onClick={onClick} className={containerClass}>
      <TextHelper>{pexValue}</TextHelper>
      <EmptyGlyphText>ø</EmptyGlyphText>
    </GlyphContainer>
  );
};

const Dot = ({
  full,
  selectedValue,
  baseValue,
  pexValue,
  locked,
  hidden,
  onClick,
}: {
  full?: boolean;
  selectedValue: boolean;
  baseValue: boolean;
  locked?: boolean;
  hidden?: boolean;
  pexValue?: number;
  onClick?: () => void;
}) => {
  const containerClass = `
    ${selectedValue ? 'selected' : ''} 
    ${locked ? 'locked' : ''} 
    ${baseValue ? 'base' : ''} 
    ${hidden ? 'hidden' : ''}
  `;
  return (
    <DotContainer className={containerClass}>
      <TextHelper>{pexValue}</TextHelper>
      <DotStyle onClick={onClick} className={full ? 'full' : 'not-full'}>
        <ellipse
          cx="50%"
          cy="50%"
          rx="40%"
          ry="30%"
          stroke="black"
          strokeWidth="2"
        />
      </DotStyle>
    </DotContainer>
  );
};

export default Dot;
