import React, { useState } from 'react';
import styled from 'styled-components';
import { ColumnTitle } from '../styles/Titles';
import { Glyph } from './Glyph';
import {
  generateHandleKeypress,
  generateHandleClick,
} from '../helpers/handlers';

const GlyphContainer = styled.span`
  span {
    font-size: 1rem;
    color: #555;
  }
  position: absolute;
  right: -1.5rem;
  top: 0;
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

const OptionItem = styled.li`
  display: flex;
  justify-content: space-between;
`;

const ActionItem = styled.li`
  display: inline-block;
  padding: 0.5rem;
  border: solid 1px #333;
  border-radius: 5px;
  margin: 0 auto;
  text-align: center;
  margin-left: 1rem;
  cursor: pointer;
  outline: none;
  position: relative;
  :focus,
  :hover {
    box-shadow: 1px 1px 1px;
    /* border-color: darkcyan; */
  }
  :active {
    box-shadow: none;
    background-color: #f7f7f7;
    top: 1px;
    left: 1px;
  }
`;

const ColumnTitleWithOptions = ({
  title,
  options = [],
  actions = [],
  button,
}: {
  title: string;
  options?: Array<{ name: string; value: boolean; onClick: () => void }>;
  actions?: Array<{ name: string; value: () => void }>;
  button?: { glyph: string; value: () => void };
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <ColumnTitle>
        {title}
        <GlyphContainer>
          {button ? (
            <Glyph
              onClick={button.value}
              name={`Add a new ${title}`}
              className="col-button"
            >
              {button.glyph}
            </Glyph>
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
      </ColumnTitle>
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
    </div>
  );
};

export default ColumnTitleWithOptions;
