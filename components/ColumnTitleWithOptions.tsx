import type { ReactNode } from 'react';
import { useState } from 'react';
import { Glyph } from './Glyph';
import {
  generateHandleKeyDown,
  generateHandleClick,
} from '../helpers/handlers';
import { ActionItem, OptionItem } from '../styles/Items';
import ColumnTitle from './ColumnTitle';
import type { TempElemType } from '../types/TempElemType';
import classNames from '../helpers/classNames';
import styles from './ColumnTitleWithOptions.module.css';

const ColumnButton = ({
  value,
  hidden,
  title,
  glyph,
}: {
  value: () => void;
  hidden?: boolean;
  title: string;
  glyph: string;
}) => {
  if (hidden) return null;

  return (
    <Glyph onClick={value} name={`Add a new ${title}`} className="col-button">
      {glyph}
    </Glyph>
  );
};

const ColumnTitleWithOptions = ({
  title,
  options = [],
  actions = [],
  button,
  children,
  currentPex,
  diffPex,
  elemArray,
  pexCalc,
  pexElems,
  inactive,
}: {
  title?: string;
  options?: Array<{ name: string; value: boolean; onClick: () => void }>;
  actions?: Array<{ name: string; value: () => void }>;
  button?: { glyph: string; value: () => void; hidden?: boolean };
  children?: ReactNode;
  currentPex?: number;
  diffPex?: number;
  elemArray?: Array<TempElemType<number>>;
  pexCalc?: (value: number) => number;
  pexElems?: Array<{
    elemArray: Array<TempElemType<number>>;
    pexCalc: (value: number) => number;
  }>;
  inactive?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <ColumnTitle
        currentPex={currentPex}
        diffPex={diffPex}
        elemArray={elemArray}
        pexCalc={pexCalc}
        title={title}
        pexElems={pexElems}
      >
        {children}
        {inactive ? null : (
          <span className={styles.glyphContainer}>
            {button ? (
              <ColumnButton
                glyph={button.glyph}
                title={title ?? ''}
                value={button.value}
                hidden={button.hidden}
              />
            ) : (
              <Glyph
                onClick={() => {
                  setOpen(!open);
                }}
                name={`${open ? 'Close' : 'Open'} ${title}`}
                className="open-col-glyph"
              >
                {open ? '▼' : '\u25b6\ufe0e'}
              </Glyph>
            )}
          </span>
        )}
      </ColumnTitle>
      {inactive ? null : (
        <div
          className={classNames(styles.optionsContainer, open ? 'opened' : '')}
          style={
            open
              ? {
                  maxHeight: `${options.length * 24 + actions.length * 41 + 20}px`,
                }
              : undefined
          }
        >
          <ul>
            {options.map(({ name, value, onClick }) => (
              <OptionItem key={`option-${name}`}>
                <span>{`${name}: ${value ? 'Oui' : 'Non'}`}</span>
                {value ? (
                  <Glyph
                    onClick={() => {
                      if (!value || !open) return;
                      onClick();
                    }}
                    inactive={!value || !open}
                    name={`${name}: Non`}
                  >
                    ✘
                  </Glyph>
                ) : (
                  <Glyph
                    onClick={() => {
                      if (value || !open) return;
                      onClick();
                    }}
                    inactive={value || !open}
                    name={`${name}: Oui`}
                  >
                    ✔
                  </Glyph>
                )}
              </OptionItem>
            ))}
            {actions.map((action) => {
              const handleClick = generateHandleClick(action.value);
              const handleKeyDown = generateHandleKeyDown(action.value);
              return (
                <ActionItem
                  onClick={handleClick}
                  onKeyDown={handleKeyDown}
                  role="button"
                  tabIndex={0}
                  key={action.name}
                >
                  {action.name}
                </ActionItem>
              );
            })}
          </ul>
          <div className="h-5" />
        </div>
      )}
    </div>
  );
};

export default ColumnTitleWithOptions;
