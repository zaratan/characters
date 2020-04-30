import React, { ReactNode } from 'react';
import styled from 'styled-components';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';

export const StyledGlyph = styled.span`
  font-size: 21px;
  padding-right: 2px;
  cursor: pointer;
  :hover,
  :focus {
    color: darkcyan;
    & ~ small {
      display: inline;
    }
  }
  &.inactive {
    cursor: default;
    :hover,
    :focus {
      color: black;
    }
  }
  z-index: 1;
  outline: none;
  &.absolute-position {
    position: absolute;
    left: -1rem;
    @media screen and (max-width: 500px) {
      left: -1.5rem;
    }
  }
`;

export const Glyph = ({
  onClick,
  inactive,
  absolutePosition,
  name,
  children,
  className,
}: {
  onClick: () => void;
  inactive?: boolean;
  absolutePosition?: boolean;
  name: string;
  children: ReactNode;
  className?: string;
}) => {
  const handleClick = generateHandleClick(onClick);
  const handleKeypress = generateHandleKeypress(onClick);

  return (
    <StyledGlyph
      aria-label={name}
      onClick={handleClick}
      onKeyPress={handleKeypress}
      role="button"
      tabIndex={inactive ? -1 : 0}
      className={`${className || ''} ${inactive ? 'inactive' : ''} ${
        absolutePosition ? 'absolute-position' : ''
      }`}
    >
      {children}
    </StyledGlyph>
  );
};
