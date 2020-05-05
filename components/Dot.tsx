import React, { useContext } from 'react';
import styled from 'styled-components';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import { Glyph } from './Glyph';
import PreferencesContext from '../contexts/PreferencesContext';

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
  &.left-aligned {
    left: -1rem;
    @media screen and (max-width: 500px) {
      left: -1.5rem;
    }
  }
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

  &.disabled {
    cursor: auto !important;
    svg.full {
      fill: black !important;
    }
    :focus {
      outline: none;
      svg {
        ellipse {
          stroke: black !important;
          stroke-width: 2px !important;
        }
      }
    }
    cursor: auto !important;
    svg.not-full {
      fill: transparent !important;
    }
    small {
      display: none !important;
    }
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
  const containerClass = `empty-glyph
    ${selected ? 'selected' : ''} 
    ${baseValue ? 'base' : ''} 
  `;
  return (
    <GlyphContainer className={containerClass}>
      <Glyph onClick={onClick} name={`${name} 0`} absolutePosition>
        ø
      </Glyph>
      <TextHelper className="left-aligned">{pexValue}</TextHelper>
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
  interactive = true,
  onClick,
}: {
  full?: boolean;
  value: number;
  name: string;
  selectedValue: boolean;
  baseValue: boolean;
  locked?: boolean;
  hidden?: boolean;
  interactive?: boolean;
  pexValue?: number;
  onClick?: () => void;
}) => {
  const containerClass = `
    ${selectedValue ? 'selected' : ''} 
    ${locked ? 'locked' : ''} 
    ${interactive ? '' : 'disabled'} 
    ${baseValue ? 'base' : ''} 
    ${hidden ? 'hidden' : ''}
  `;

  const handleClick = generateHandleClick(onClick);

  const handleKeyPress = generateHandleKeypress(onClick);
  const { showPex } = useContext(PreferencesContext);

  return (
    <DotContainer
      className={containerClass}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="radio"
      tabIndex={selectedValue || !interactive ? -1 : 0}
      aria-checked={full}
      aria-label={`${name} ${value}`}
    >
      {showPex ? <TextHelper>{pexValue}</TextHelper> : null}
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
