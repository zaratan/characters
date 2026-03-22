import { useContext } from 'react';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';
import { Glyph } from './Glyph';
import PreferencesContext from '../contexts/PreferencesContext';
import ThemeContext from '../contexts/ThemeContext';
import { darkTheme } from '../styles/Theme';

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
  const containerClass = `dot-glyph-container empty-glyph
    ${selected ? 'selected' : ''}
    ${baseValue ? 'base' : ''}
  `;
  return (
    <span className={containerClass}>
      <Glyph onClick={onClick} name={`${name} 0`} absolutePosition>
        ø
      </Glyph>
      <small className="dot-text-helper left-aligned">{pexValue}</small>
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
  const containerClass = `dot-container
    ${selectedValue ? 'selected' : ''}
    ${locked ? 'locked' : ''}
    ${!inactive ? '' : 'disabled'}
    ${baseValue ? 'base' : ''}
    ${hidden ? 'hidden' : ''}
  `;

  const clickAction = !inactive ? (onClick ?? (() => {})) : () => {};

  const handleClick = generateHandleClick(clickAction);

  const handleKeyPress = generateHandleKeypress(clickAction);
  const { showPex } = useContext(PreferencesContext);
  const { darkMode } = useContext(ThemeContext);

  return (
    <span
      className={containerClass}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="radio"
      tabIndex={selectedValue || inactive ? -1 : 0}
      aria-checked={full}
      aria-label={`${name} ${value}`}
    >
      {showPex ? <small className="dot-text-helper">{pexValue}</small> : null}
      <svg className={`dot-svg ${full ? 'full' : 'not-full'}`}>
        <ellipse
          cx="50%"
          cy="50%"
          rx="40%"
          ry="30%"
          stroke={darkMode ? darkTheme.dotColor : 'black'}
          strokeWidth="2"
        />
      </svg>
    </span>
  );
};

export default Dot;
