import classNames from '../helpers/classNames';
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import { darkTheme, lightTheme } from '../styles/Theme';
import { Glyph } from './Glyph';

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
  const { darkMode } = useContext(ThemeContext);
  return (
    <span
      aria-label={name}
      onClick={handleClick}
      onKeyPress={handleKeypress}
      role="button"
      tabIndex={inactive ? -1 : 0}
      className={classNames('square-container', inactive && 'inactive')}
    >
      <svg className={classNames('square-svg', hoverCheck && 'hover-check')}>
        <rect
          x="3"
          y="9"
          stroke={darkMode ? darkTheme.color : lightTheme.color}
          strokeWidth="2"
          width="18"
          height="18"
        />
        <path
          d="M6 12 L18 24 Z"
          className={`first ${timeChecked >= 1 ? 'checked' : ''}`}
          stroke={darkMode ? darkTheme.color : lightTheme.color}
          strokeWidth="2"
        />
        <path
          d="M18 12 L6 24 Z"
          className={`second ${timeChecked >= 2 ? 'checked' : ''} ${
            hoverCheck ? 'slow-checked' : ''
          }`}
          stroke={darkMode ? darkTheme.color : lightTheme.color}
          strokeWidth="2"
        />
        <path
          d="M12 11 L12 25 Z"
          className={`third ${timeChecked >= 3 ? 'checked' : ''}`}
          stroke={darkMode ? darkTheme.color : lightTheme.color}
          strokeWidth="2"
        />
      </svg>
    </span>
  );
};

export default Square;
