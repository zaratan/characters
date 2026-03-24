'use client';

import type { HTMLAttributes } from 'react';

import classNames from '../../helpers/classNames';
import styles from './ButtonGlyphContainer.module.css';

const ButtonGlyphContainer = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={classNames(
      'absolute right-[-1.5rem] top-2 z-[1]',
      styles.buttonGlyphContainer,
      className?.includes('active') && styles.active,
      !className?.includes('no-reposition') &&
        'max-md:right-12 max-sm-plus:right-8 max-xs:right-4',
      className
    )}
    {...props}
  />
);

export default ButtonGlyphContainer;
