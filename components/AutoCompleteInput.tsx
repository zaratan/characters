import React, { useState, useMemo, useRef, KeyboardEvent, Ref } from 'react';
import { useDebounce, useClickAway } from 'react-use';
import Fuse from 'fuse.js';
import styled from 'styled-components';
import { generateHandleClick } from '../helpers/handlers';

const SuggestionContainer = styled.span`
  /* margin-top: -0.25rem; */
  left: 0;
  display: none;
  &.open {
    display: inherit;
  }
`;

const Form = styled.form`
  position: relative;
`;

const Input = styled.input`
  border: 1px solid lightgrey;
  padding: 0.5rem;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #8bcbe0;
    border-width: 1px;
  }
`;

const SuggestionList = styled.ul`
  border: 1px solid lightgray;
`;

const Suggestion = styled.li`
  span {
    cursor: pointer;
    padding: 0.5rem;
    width: 100%;
    height: 100%;
    display: inline-block;
    &:hover {
      background-color: #8bcbe0;
    }
    &:focus {
      outline: none;
      background-color: #b4dae7;
    }
  }
`;

const generateHandleKeypressInput = (
  listRef: React.MutableRefObject<HTMLUListElement>
) => (e: KeyboardEvent) => {
  if (e.key !== 'ArrowDown') {
    return;
  }
  e.preventDefault();

  const span: HTMLSpanElement = listRef.current.querySelector('li span');

  return span && span.focus();
};

const generateHandleKeypressSpan = (
  changeFunc: (e: KeyboardEvent) => void,
  listRef: React.MutableRefObject<HTMLUListElement>,
  inputRef: React.MutableRefObject<HTMLInputElement>
) => (e: KeyboardEvent) => {
  if (
    e.key !== 'Enter' &&
    e.key !== ' ' &&
    e.key !== 'ArrowDown' &&
    e.key !== 'ArrowUp'
  ) {
    return;
  }
  e.preventDefault();

  if (e.key === 'Enter' || e.key === ' ') {
    changeFunc(e);
  } else {
    const focusedSpan: HTMLSpanElement = listRef.current.querySelector(
      'li span:focus'
    );
    const spans: Array<HTMLSpanElement> = Array.from(
      listRef.current.querySelectorAll('li span')
    );
    const currentIndex = spans.indexOf(focusedSpan);
    if (e.key === 'ArrowDown') {
      if (spans.length > currentIndex + 1) {
        spans[currentIndex + 1].focus();
      }
    } else if (currentIndex > 0) {
      spans[currentIndex - 1].focus();
    } else {
      inputRef.current.focus();
    }
  }
};

interface Props<T> {
  onSubmit: (value: T | string) => void;
  autocompleteOptions: Array<T>;
  display: string | ((item: T) => string);
  baseValue?: string;
  searchKeys: Array<string>;
  placeholder?: string;
}

const AutoCompleteInput = <T extends Record<string, unknown>>({
  autocompleteOptions,
  onSubmit,
  display,
  baseValue = '',
  placeholder,
  searchKeys,
}: Props<T>) => {
  const [inputValue, setInputValue] = useState(baseValue);
  const [isOpen, setIsOpen] = useState(false);
  const autocompleList = useMemo(
    () =>
      new Fuse<T>(autocompleteOptions, {
        includeScore: true,
        keys: searchKeys,
      }),
    [autocompleteOptions, searchKeys]
  );
  const [
    autocompleteMatchingOptions,
    setAutocompleteMatchingOptions,
  ] = useState<Array<T>>([]);
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

  const submitAction = (value: T | string) => {
    setInputValue('');
    setIsOpen(false);
    onSubmit(value);
  };

  const suggestionListRef = useRef(null);
  const inputRef = useRef(null);
  const clickHandler = (value: T) =>
    generateHandleClick(() => submitAction(value));
  const keyHandler = (value: T) =>
    generateHandleKeypressSpan(
      () => submitAction(value),
      suggestionListRef,
      inputRef
    );

  const ref = useRef(null);
  useClickAway(ref, () => {
    setIsOpen(false);
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        submitAction(inputValue);
      }}
      ref={ref}
    >
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.currentTarget.value)}
        placeholder={placeholder}
        onFocus={() => setIsOpen(inputValue !== '')}
        onKeyDown={generateHandleKeypressInput(suggestionListRef)}
        ref={inputRef}
      />
      <SuggestionContainer
        className={
          isOpen && autocompleteMatchingOptions.length > 0 ? 'open' : ''
        }
      >
        <SuggestionList ref={suggestionListRef}>
          {autocompleteMatchingOptions.slice(0, 5).map((match) => {
            let displayName: string;
            if (typeof display === 'string') {
              displayName = String(match[display]);
            } else {
              displayName = display(match);
            }

            return (
              <Suggestion key={displayName}>
                <span
                  tabIndex={0}
                  onClick={clickHandler(match)}
                  onKeyDown={keyHandler(match)}
                  role="button"
                >
                  {displayName}
                </span>
              </Suggestion>
            );
          })}
        </SuggestionList>
      </SuggestionContainer>
    </Form>
  );
};

export default AutoCompleteInput;
