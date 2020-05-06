import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';
import { Glyph } from './Glyph';
import {
  generateHandleKeypress,
  generateHandleClick,
} from '../helpers/handlers';
import { ActionItem, OptionItem } from '../styles/Items';
import ColumnTitle from './ColumnTitle';
import { TempElemType } from '../types/TempElemType';

const GlyphContainer = styled.span`
  span {
    font-size: 1rem;
    color: #555;
  }
  position: absolute;
  right: -1.5rem;
  top: 0;
  height: 100%;
`;

const OptionsContainer = styled.div<{ elemCount: number; actionCount: number }>`
  max-height: 0;
  opacity: 0;
  visibility: hidden;
  &.opened {
    max-height: ${(props) =>
      `${props.elemCount * 24 + props.actionCount * 41 + 20}px`};
    opacity: 1;
    visibility: visible;
  }
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
`;
const OptionsSeparator = styled.div`
  height: 20px;
`;

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
          <GlyphContainer>
            {button ? (
              <ColumnButton
                glyph={button.glyph}
                title={title}
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
                {open ? '▼' : '▶'}
              </Glyph>
            )}
          </GlyphContainer>
        )}
      </ColumnTitle>
      {inactive ? null : (
        <OptionsContainer
          className={open ? 'opened' : ''}
          elemCount={options.length}
          actionCount={actions.length}
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
              const handleKeypress = generateHandleKeypress(action.value);
              return (
                // eslint-disable-next-line styled-components-a11y/no-noninteractive-element-to-interactive-role
                <ActionItem
                  onClick={handleClick}
                  onKeyPress={handleKeypress}
                  role="button"
                  tabIndex={0}
                  key={action.name}
                >
                  {action.name}
                </ActionItem>
              );
            })}
          </ul>
          <OptionsSeparator />
        </OptionsContainer>
      )}
    </div>
  );
};

export default ColumnTitleWithOptions;
