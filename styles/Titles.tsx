'use client';
import type { HTMLAttributes } from 'react';
import classNames from '../helpers/classNames';

export const Title = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={classNames(
      'font-cloister text-[2rem]',
      className?.includes('victorian-queen') &&
        'font-victorian! text-[6rem]! font-thin!',
      className
    )}
    {...props}
  />
);

export const StyledColumnTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <Title
    className={classNames(
      'relative mx-auto w-fit max-md:max-w-[70%] justify-self-center',
      className
    )}
    {...props}
  />
);

export const SubTitle = (props: HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className="font-cloister text-[1.6rem] text-neutral-600 dark:text-neutral-300 inline whitespace-nowrap"
    {...props}
  />
);
