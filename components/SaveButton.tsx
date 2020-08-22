import React, { ReactNode } from 'react';
import styled from 'styled-components';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import { useSave } from '../hooks/useSave';

const SaveButton = ({ children }: { children: ReactNode }) => {
  const action = useSave();
  const handleClick = generateHandleClick(action);
  const handleKeypress = generateHandleKeypress(action);
  return (
    <Button
      role="button"
      onClick={handleClick}
      onKeyPress={handleKeypress}
      tabIndex={0}
    >
      {children}
    </Button>
  );
};

const Button = styled.span`
  &:focus {
    & > li {
      padding: 1.5rem;
      .full-text {
        max-width: 160px;
        padding-left: 1rem;
      }
    }
  }
`;

export default SaveButton;
