import React, { useState } from 'react';
import styled from 'styled-components';
import { ColumnTitle } from '../styles/Titles';
import { Glyph } from './Glyph';

const GlyphContainer = styled.span`
  span {
    font-size: 1rem;
    color: #555;
  }
  position: absolute;
  right: -1.5rem;
`;

const OptionsContainer = styled.div<{ elemCount: number }>`
  max-height: 0;
  opacity: 0;
  &.opened {
    max-height: ${(props) => `${props.elemCount * 24 + 20}px`};
    opacity: 1;
  }
  transition: max-height 0.5s ease-in-out, opacity 0.5s ease-in-out;
`;
const OptionsSeparator = styled.div`
  height: 20px;
`;

const OptionItem = styled.li`
  display: flex;
  justify-content: space-between;
`;

const ColumnTitleWithOptions = ({
  title,
  options,
}: {
  title: string;
  options: Array<{ name: string; value: boolean }>;
}) => {
  const [open, setOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState(options);
  const optionToggle = (name: string) => {
    setLocalOptions(
      localOptions.map((option) =>
        option.name !== name ? option : { name, value: !option.value }
      )
    );
  };
  return (
    <div>
      <ColumnTitle>
        {title}
        <GlyphContainer>
          <Glyph
            onClick={() => {
              setOpen(!open);
            }}
            name={`${open ? 'Close' : 'Open'} ${title}`}
          >
            {open ? '▼' : '▶'}
          </Glyph>
        </GlyphContainer>
      </ColumnTitle>
      <OptionsContainer
        className={open ? 'opened' : ''}
        elemCount={localOptions.length}
      >
        <ul>
          {localOptions.map(({ name, value }) => (
            <OptionItem>
              <span>{`${name}: ${value ? 'Oui' : 'Non'}`}</span>
              {value ? (
                <Glyph
                  onClick={() => {
                    if (!value) return;
                    optionToggle(name);
                  }}
                  inactive={!value}
                  name={`${name}: Non`}
                >
                  ✘
                </Glyph>
              ) : (
                <Glyph
                  onClick={() => {
                    console.log({ name, value });
                    if (value) return;
                    optionToggle(name);
                  }}
                  inactive={value}
                  name={`${name}: Oui`}
                >
                  ✔
                </Glyph>
              )}
            </OptionItem>
          ))}
        </ul>
        <OptionsSeparator />
      </OptionsContainer>
    </div>
  );
};

export default ColumnTitleWithOptions;
