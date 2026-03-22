import type { HTMLAttributes, ReactNode } from 'react';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import classNames from '../helpers/classNames';

export const StyledGlyph = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span className={classNames('glyph', className)} {...props} />
);

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
      className={classNames(
        className,
        inactive && 'inactive',
        absolutePosition && 'absolute-position'
      )}
    >
      {children}
    </StyledGlyph>
  );
};
