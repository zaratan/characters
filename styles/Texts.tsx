'use client';

import type { HTMLAttributes, InputHTMLAttributes } from 'react';

import classNames from '../helpers/classNames';

export const HandLargeText = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={classNames(
      'font-bilbo text-[2rem] text-neutral-700 dark:text-neutral-300',
      className?.includes('left-padded') && 'pl-8',
      className?.includes('label') && 'max-md:pl-8 max-md:w-full',
      className
    )}
    {...props}
  />
);

export const HandLargeEditableText = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={classNames(
      'font-bilbo text-[2rem] text-neutral-700 dark:text-neutral-300 bg-transparent border-none shrink grow min-w-0 indent-px focus:outline-none max-md:pl-8 max-md:w-full',
      className?.includes('left-padded') && 'pl-8',
      className
    )}
    {...props}
  />
);

export const HandText = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={classNames(
      'font-bilbo text-[1.5rem] text-neutral-700 dark:text-neutral-300 border-0 border-solid border-b border-black dark:border-neutral-300 shrink grow min-w-[70px] indent-px focus:outline-none max-md:text-center max-md:w-full',
      className?.includes('low') && 'text-[1.2rem]',
      className?.includes('left-padded') && 'pl-8',
      className?.includes('very-small')
        ? 'text-base w-4 min-w-0 appearance-none inline-block'
        : className?.includes('small') && 'max-w-20 w-full',
      className
    )}
    {...props}
  />
);

export const HandEditableText = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={classNames(
      'font-bilbo text-[1.5rem] text-neutral-700 dark:text-neutral-300 bg-transparent border-0 border-solid border-b border-black dark:border-neutral-300 shrink grow min-w-[70px] indent-px focus:outline-none max-md:text-center max-md:w-full',
      className?.includes('low') && 'text-[1.2rem]',
      className?.includes('left-padded') && 'pl-8',
      className?.includes('very-small')
        ? 'text-base w-4 min-w-0 appearance-none [appearance:textfield]'
        : className?.includes('small') && 'max-w-20',
      className
    )}
    {...props}
  />
);
