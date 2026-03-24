'use client';
import type { HTMLAttributes } from 'react';
import classNames from '../../helpers/classNames';

const TextHelper = ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
  <small
    className={classNames(
      'absolute text-red-600 dark:text-red-500 flex items-center',
      className?.includes('closer') ? 'right-[-0.5rem]' : 'right-[-1.3rem]',
      className
    )}
    {...props}
  />
);

export default TextHelper;
