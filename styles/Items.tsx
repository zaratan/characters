'use client';
import type { LiHTMLAttributes } from 'react';

export const OptionItem = (props: LiHTMLAttributes<HTMLLIElement>) => (
  <li className="flex justify-between" {...props} />
);

export const ActionItem = (props: LiHTMLAttributes<HTMLLIElement>) => (
  <li
    className="inline-block p-2 border border-neutral-300 dark:border-neutral-500 rounded-[5px] mx-auto ml-4 text-center cursor-pointer relative focus-visible:outline-2 hover:shadow-[1px_1px_1px] focus:shadow-[1px_1px_1px] active:shadow-none active:bg-neutral-50 active:dark:bg-neutral-600 active:top-px active:left-px"
    {...props}
  />
);
