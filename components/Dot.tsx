import React, { useContext } from 'react';
import styled from 'styled-components';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import { Glyph } from './Glyph';
import PreferencesContext from '../contexts/PreferencesContext';
import ThemeContext from '../contexts/ThemeContext';
import { darkTheme } from '../styles/Theme';

const DotStyle = styled.svg`
  color: ${(props) => props.theme.color};
  padding: 0 0.05rem;
  fill: transparent;
  &.full {
    fill: ${(props) => props.theme.glyphGray};
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
      fill: ${(props) => props.theme.dotColor} !important;
    }
    ~ span {
      svg {
        fill: ${(props) => props.theme.dotColor} !important;
      }
    }
    ~ span.locked {
      svg {
        fill: ${(props) => props.theme.dotColor} !important;
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
    fill: ${(props) => props.theme.dotColor} !important;
  }

  &.disabled {
    cursor: auto !important;
    svg.full {
      fill: ${(props) => props.theme.dotColor} !important;
    }
    :focus {
      outline: none;
      svg {
        ellipse {
          stroke: ${(props) => props.theme.dotColor} !important;
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
      color: ${(props) => props.theme.red};
    }
  }

  &.selected small {
    display: inline;
    color: ${(props) => props.theme.red};
  }

  &.hidden {
    display: none;
  }

  &.base:not(.selected) svg {
    fill: ${(props) => props.theme.dotBaseNotSelectColot} !important;
  }
`;

const GlyphContainer = styled.span`
  position: relative;
  &.base.selected {
    small {
      display: none;
      color: ${(props) => props.theme.red};
    }
  }
  &.selected small {
    display: inline;
    color: ${(props) => props.theme.red};
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
  onClick,
  inactive,
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
  inactive?: boolean;
}) => {
  const containerClass = `
    ${selectedValue ? 'selected' : ''} 
    ${locked ? 'locked' : ''} 
    ${!inactive ? '' : 'disabled'} 
    ${baseValue ? 'base' : ''} 
    ${hidden ? 'hidden' : ''}
  `;

  const clickAction = !inactive ? onClick : () => {};

  const handleClick = generateHandleClick(clickAction);

  const handleKeyPress = generateHandleKeypress(clickAction);
  const { showPex } = useContext(PreferencesContext);
  const { darkMode } = useContext(ThemeContext);

  return (
    <DotContainer
      className={containerClass}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="radio"
      tabIndex={selectedValue || inactive ? -1 : 0}
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
          stroke={darkMode ? darkTheme.dotColor : 'black'}
          strokeWidth="2"
        />
      </DotStyle>
    </DotContainer>
  );
};

export default Dot;
