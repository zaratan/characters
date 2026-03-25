import type { MouseEvent, KeyboardEvent } from 'react';

export const generateHandleClick =
  (changeFunc: () => void) => (e: MouseEvent<HTMLSpanElement>) => {
    changeFunc();
    e.currentTarget.blur();
  };

export const generateHandleKeyDown =
  (changeFunc: () => void) => (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    e.preventDefault();
    changeFunc();
  };
