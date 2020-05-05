import React, { ReactNode, FormEvent } from 'react';
import { ActionItem } from '../styles/Items';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';

const Button = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: (e: FormEvent) => void;
}) => {
  const handleClick = generateHandleClick(onClick);
  const handleKeypress = generateHandleKeypress(onClick);
  return (
    <ActionItem
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyPress={handleKeypress}
    >
      {children}
    </ActionItem>
  );
};

export default Button;
