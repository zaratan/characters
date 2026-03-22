'use client';

import type { HTMLAttributes } from 'react';

import classNames from '../../helpers/classNames';

const ButtonGlyphContainer = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={classNames(
      'absolute right-[-1.5rem] top-2 z-[1] button-glyph-container',
      className?.includes('active') && 'active',
      !className?.includes('no-reposition') &&
        'max-md:right-12 max-sm-plus:right-8 max-xs:right-4',
      className
    )}
    {...props}
  />
);

export default ButtonGlyphContainer;
