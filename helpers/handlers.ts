import { MouseEvent, KeyboardEvent, FormEvent } from 'react';

export const generateHandleClick = (changeFunc: (e: FormEvent) => void) => (
  e: MouseEvent<HTMLSpanElement>
) => {
  changeFunc(e);
  e.currentTarget.blur();
};

export const generateHandleKeypress = (changeFunc: (e: FormEvent) => void) => (
  e: KeyboardEvent
) => {
  if (e.key !== 'Enter' && e.key !== ' ') {
    return;
  }
  e.preventDefault();
  changeFunc(e);
};
