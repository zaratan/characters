import { useContext } from 'react';
import {
  generateHandleClick,
  generateHandleKeyDown,
} from '../helpers/handlers';
import { Glyph } from './Glyph';
import PreferencesContext from '../contexts/PreferencesContext';
import styles from './Dot.module.css';
import classNames from '../helpers/classNames';

export const EmptyGlyph = ({
  pexValue,
  onClick,
  selected,
  baseValue,
  name,
}: {
  selected: boolean;
  pexValue: number;
  baseValue: boolean;
  onClick: () => void;
  name: string;
}) => {
  const containerClass = classNames(
    styles.dotGlyphContainer,
    'empty-glyph',
    selected && styles.selected,
    baseValue && styles.base
  );
  return (
    <span className={containerClass}>
      <Glyph onClick={onClick} name={`${name} 0`} absolutePosition>
        ø
      </Glyph>
      <small className={classNames(styles.dotTextHelper, styles.leftAligned)}>
        {pexValue}
      </small>
    </span>
  );
};

const Dot = ({
  full,
  value,
  name,
  selectedValue,
  baseValue,
  pexValue,
  locked,
  hidden,
  onClick,
  inactive,
}: {
  full?: boolean;
  value: number;
  name: string;
  selectedValue: boolean;
  baseValue: boolean;
  locked?: boolean;
  hidden?: boolean;
  pexValue?: number;
  onClick?: () => void;
  inactive?: boolean;
}) => {
  const containerClass = classNames(
    styles.dotContainer,
    selectedValue && styles.selected,
    locked && styles.locked,
    inactive && styles.disabled,
    baseValue && styles.base,
    hidden && styles.hidden
  );

  const clickAction = !inactive ? (onClick ?? (() => {})) : () => {};

  const handleClick = generateHandleClick(clickAction);

  const handleKeyDown = generateHandleKeyDown(clickAction);
  const { showPex } = useContext(PreferencesContext);

  return (
    <span
      className={containerClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="radio"
      tabIndex={selectedValue || inactive ? -1 : 0}
      aria-checked={full}
      aria-label={`${name} ${value}`}
    >
      {showPex ? (
        <small className={styles.dotTextHelper}>{pexValue}</small>
      ) : null}
      <svg
        className={classNames(
          styles.dotSvg,
          full
            ? classNames(styles.full, 'full')
            : classNames(styles.notFull, 'not-full')
        )}
      >
        <ellipse cx="50%" cy="50%" rx="40%" ry="30%" strokeWidth="2" />
      </svg>
    </span>
  );
};

export default Dot;
