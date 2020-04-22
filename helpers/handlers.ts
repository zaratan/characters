import { MouseEvent, KeyboardEvent } from 'react';

export const generateHandleClick = (changeFunc: () => void) => (
  e: MouseEvent<HTMLSpanElement>
) => {
  changeFunc();
  e.currentTarget.blur();
};

export const generateHandleKeypress = (changeFunc: () => void) => (
  e: KeyboardEvent
) => {
  if (
    e.keyCode !== 32 &&
    e.keyCode !== 13 &&
    e.charCode !== 32 &&
    e.charCode !== 13
  ) {
    return;
  }
  e.preventDefault();
  changeFunc();
};
