'use client';
import type { HTMLAttributes } from 'react';
import classNames from '../helpers/classNames';

type HorizontalSectionProps = HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
};

export const HorizontalSection = ({
  className,
  as: Component = 'div',
  ...props
}: HorizontalSectionProps) => (
  <Component
    className={classNames(
      'grid grid-cols-3 gap-x-[50px] auto-rows-auto gap-y-8',
      'max-3xl:grid-cols-2 max-xl:grid-cols-1',
      'horizontal-section', // CSS hook for any-hover rules in globals.css
      className?.includes('compact') && 'gap-y-0!',
      className
    )}
    {...props}
  />
);
