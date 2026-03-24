'use client';
import type { HTMLAttributes } from 'react';
import classNames from '../helpers/classNames';

export const EmptyLine = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames(
      className?.includes('thin') ? 'h-4' : 'h-12',
      'flex items-center w-full',
      className?.includes('mobile-only') && 'lg:hidden'
    )}
    {...props}
  />
);

export const BlackLine = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames(
      className?.includes('thin') ? 'h-px' : 'h-[3px]',
      'w-full bg-black dark:bg-neutral-300',
      className?.includes('mobile-only') && 'lg:hidden'
    )}
    {...props}
  />
);
