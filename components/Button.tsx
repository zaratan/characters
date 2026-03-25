import type { ReactNode } from 'react';
import { ActionItem } from '../styles/Items';
import {
  generateHandleClick,
  generateHandleKeyDown,
} from '../helpers/handlers';

const Button = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  const handleClick = generateHandleClick(onClick);
  const handleKeyDown = generateHandleKeyDown(onClick);
  return (
    <ActionItem
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </ActionItem>
  );
};

export default Button;
