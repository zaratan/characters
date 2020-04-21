import React, { MouseEvent, KeyboardEvent } from 'react';
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
  :hover,
  :focus {
    svg {
      fill: #555 !important;
    }
    ~ span {
      svg {
        fill: #555 !important;
      }
    }
    ~ span.locked {
      svg {
        fill: black !important;
      }
    }
  }

  :focus {
    outline: none;
    svg {
      ellipse {
        stroke: darkcyan;
        stroke-width: 3px;
      }
    }
  }

  &.locked svg {
    fill: black !important;
  }

  :hover,
  :focus {
    small {
      display: inline;
    }
  }

  :not(.selected) {
    cursor: pointer;
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

  &.hidden {
    display: none;
  }

  &.base:not(.selected) svg {
    fill: #bbb !important;
  }
`;

const GlyphContainer = styled.span`
  position: relative;
  :hover,
  :focus {
    small {
      display: inline;
    }
  }
  :focus {
    outline: none;
    color: darkcyan;
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
  name,
}: {
  selected: boolean;
  pexValue: number;
  baseValue: boolean;
  onClick: () => void;
  name: string;
}) => {
  const containerClass = `
    ${selected ? 'selected' : ''} 
    ${baseValue ? 'base' : ''} 
  `;
  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    onClick();
    e.currentTarget.blur();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (
      e.keyCode !== 32 &&
      e.keyCode !== 13 &&
      e.charCode !== 32 &&
      e.charCode !== 13
    ) {
      return;
    }
    e.preventDefault();
    onClick();
  };
  return (
    <GlyphContainer
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      className={containerClass}
      role="button"
      tabIndex={0}
      aria-label={`${name} 0`}
    >
      <TextHelper>{pexValue}</TextHelper>
      <EmptyGlyphText>ø</EmptyGlyphText>
    </GlyphContainer>
  );
};

const Dot = ({
  full,
  value,
  name,
  selectedValue,
  baseValue,
  pexValue,
  locked,
  hidden,
  onClick,
}: {
  full?: boolean;
  value: number;
  name: string;
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

  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    onClick();
    e.currentTarget.blur();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (
      e.keyCode !== 32 &&
      e.keyCode !== 13 &&
      e.charCode !== 32 &&
      e.charCode !== 13
    ) {
      return;
    }
    e.preventDefault();
    onClick();
  };

  return (
    <DotContainer
      className={containerClass}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="radio"
      tabIndex={selectedValue ? -1 : 0}
      aria-checked={full}
      aria-label={`${name} ${value}`}
    >
      <TextHelper>{pexValue}</TextHelper>
      <DotStyle className={full ? 'full' : 'not-full'}>
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
