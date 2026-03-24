import classNames from '../helpers/classNames';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import { Glyph } from './Glyph';
import styles from './Square.module.css';

export const EmptyGlyph = ({
  onClick,
  inactive,
  type,
}: {
  onClick: () => void;
  inactive: boolean;
  type: string;
}) => {
  let handleClick = () => {};
  if (!inactive) {
    handleClick = onClick;
  }
  return (
    <Glyph
      name={`Vider ${type}`}
      onClick={handleClick}
      inactive={inactive}
      absolutePosition
      className="empty-glyph"
    >
      ø
    </Glyph>
  );
};

const Square = ({
  checked,
  onClick,
  inactive,
  name,
}: {
  name: string;
  inactive?: boolean;
  checked: boolean | number;
  onClick: () => void;
}) => {
  const timeChecked = checked === true ? 2 : Number(checked);
  const hoverCheck = checked === true || checked === false;
  const handleClick = generateHandleClick(inactive ? () => {} : onClick);
  const handleKeypress = generateHandleKeypress(inactive ? () => {} : onClick);
  return (
    <span
      aria-label={name}
      onClick={handleClick}
      onKeyPress={handleKeypress}
      role="button"
      tabIndex={inactive ? -1 : 0}
      className={classNames(
        styles.squareContainer,
        inactive && classNames(styles.inactive, 'inactive')
      )}
    >
      <svg
        className={classNames(
          styles.squareSvg,
          hoverCheck && styles.hoverCheck
        )}
      >
        <rect x="3" y="9" strokeWidth="2" width="18" height="18" />
        <path
          d="M6 12 L18 24 Z"
          className={classNames(
            styles.first,
            'first',
            timeChecked >= 1 && classNames(styles.checked, 'checked')
          )}
          strokeWidth="2"
        />
        <path
          d="M18 12 L6 24 Z"
          className={classNames(
            styles.second,
            'second',
            timeChecked >= 2 && classNames(styles.checked, 'checked'),
            hoverCheck && classNames(styles.slowChecked, 'slow-checked')
          )}
          strokeWidth="2"
        />
        <path
          d="M12 11 L12 25 Z"
          className={classNames(
            styles.third,
            'third',
            timeChecked >= 3 && classNames(styles.checked, 'checked')
          )}
          strokeWidth="2"
        />
      </svg>
    </span>
  );
};

export default Square;
