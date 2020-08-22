import React, { useState, useMemo, useRef } from 'react';
import { useDebounce, useClickAway } from 'react-use';
import Fuse from 'fuse.js';
import styled from 'styled-components';
import {
  generateHandleClick,
  generateHandleKeypress,
} from '../helpers/handlers';

const SuggestionContainer = styled.span`
  position: absolute;
  top: 2rem;
  left: 0;
  display: none;
  &.open {
    display: inherit;
  }
`;

const Form = styled.form`
  position: relative;
`;

const AutoCompleteInput = ({
  autocompleteOptions,
  onSubmit,
  baseValue = '',
  placeholder,
}: {
  onSubmit: (value: string) => void;
  autocompleteOptions: Array<string>;
  baseValue?: string;
  placeholder?: string;
}) => {
  const [inputValue, setInputValue] = useState(baseValue);
  const [isOpen, setIsOpen] = useState(false);
  const autocompleList = useMemo(
    () => new Fuse(autocompleteOptions, { includeScore: true }),
    [autocompleteOptions]
  );
  const [
    autocompleteMatchingOptions,
    setAutocompleteMatchingOptions,
  ] = useState<Array<string>>([]);
  useDebounce(
    () => {
      setAutocompleteMatchingOptions(
        autocompleList.search(inputValue).map((e) => e.item)
      );
      setIsOpen(inputValue !== '');
    },
    100,
    [inputValue]
  );

  const clickHandler = (value) => generateHandleClick(() => onSubmit(value));
  const keyHandler = (value) => generateHandleKeypress(() => onSubmit(value));

  const ref = useRef(null);
  useClickAway(ref, () => {
    setIsOpen(false);
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(autocompleteMatchingOptions[0]);
        setInputValue('');
      }}
      ref={ref}
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.currentTarget.value)}
        placeholder={placeholder}
        onFocus={() => setIsOpen(inputValue !== '')}
      />
      <SuggestionContainer className={isOpen ? 'open' : ''}>
        <ul>
          {autocompleteMatchingOptions.slice(0, 10).map((match) => (
            <li key={match}>
              <span
                tabIndex={0}
                onClick={clickHandler(match)}
                onKeyPress={keyHandler(match)}
                role="button"
              >
                {match}
              </span>
            </li>
          ))}
        </ul>
      </SuggestionContainer>
    </Form>
  );
};

export default AutoCompleteInput;
