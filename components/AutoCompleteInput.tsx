import React, {
  useState,
  useMemo,
  useRef,
  KeyboardEvent,
  ComponentType,
  InputHTMLAttributes,
  DetailedHTMLProps,
  useEffect,
} from 'react';
import { useDebounce, useClickAway } from 'react-use';
import Fuse from 'fuse.js';
import styled from 'styled-components';
import { generateHandleClick } from '../helpers/handlers';

const SuggestionContainer = styled.span`
  /* margin-top: -0.25rem; */
  left: 0;
  display: none;
  &.open {
    width: 100%;
    display: inherit;
    position: absolute;
    z-index: 2;
    background-color: ${(props) => props.theme.background};
  }
`;

const Form = styled.form`
  position: relative;
`;

const Input = styled.input`
  border: 1px solid ${(props) => props.theme.borderColor};
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};
  padding: 0.5rem;
  width: 100%;
  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.focusBorderColor};
    border-width: 1px;
  }
`;

const SuggestionList = styled.ul`
  border: 1px solid ${(props) => props.theme.borderColor};
`;

const Suggestion = styled.li`
  span {
    cursor: pointer;
    padding: 0.5rem;
    width: 100%;
    height: 100%;
    display: inline-block;
    color: ${(props) => props.theme.color};
    &:hover {
      background-color: ${(props) => props.theme.hoverBackgroundColor};
    }
    &:focus {
      outline: none;
      background-color: ${(props) => props.theme.focusBackgroundColor};
    }
  }
`;

const generateHandleKeypressInput = (
  listRef: React.MutableRefObject<HTMLUListElement>,
  close: () => void
) => (e: KeyboardEvent) => {
  console.log(e.key);
  if (e.key !== 'ArrowDown' && e.key !== 'Escape') {
    return;
  }
  e.preventDefault();
  if (e.key === 'Escape') {
    return close();
  }
  const span: HTMLSpanElement = listRef.current.querySelector('li span');

  return span && span.focus();
};

const generateHandleKeypressSpan = (
  changeFunc: (e: KeyboardEvent) => void,
  listRef: React.MutableRefObject<HTMLUListElement>,
  inputRef: React.MutableRefObject<HTMLInputElement>,
  close: () => void
) => (e: KeyboardEvent) => {
  if (
    e.key !== 'Enter' &&
    e.key !== ' ' &&
    e.key !== 'ArrowDown' &&
    e.key !== 'ArrowUp' &&
    e.key !== 'Escape'
  ) {
    return;
  }
  e.preventDefault();

  if (e.key === 'Escape') {
    inputRef.current.focus();
    return close();
  }

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
  StyledInput?: ComponentType<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  >;
  submitOnClickOut?: boolean;
}

const AutoCompleteInput = <T extends Record<string, unknown>>({
  autocompleteOptions,
  onSubmit,
  display,
  baseValue = '',
  placeholder,
  searchKeys,
  StyledInput = Input,
  submitOnClickOut,
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
  useEffect(() => {
    setInputValue(baseValue);
  }, [baseValue]);
  const [
    autocompleteMatchingOptions,
    setAutocompleteMatchingOptions,
  ] = useState<Array<T>>([]);
  useDebounce(
    () => {
      setAutocompleteMatchingOptions(
        autocompleList.search(inputValue).map((e) => e.item)
      );
      setIsOpen(inputValue !== baseValue || (isOpen && inputValue !== ''));
    },
    100,
    [inputValue]
  );

  const submitAction = (value: T | string) => {
    setInputValue(baseValue);
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
      inputRef,
      () => {
        setIsOpen(false);
      }
    );

  const ref = useRef(null);
  useClickAway(ref, () => {
    if (!isOpen) return;

    if (submitOnClickOut) {
      submitAction(inputValue);
    }
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
      <StyledInput
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.currentTarget.value)}
        placeholder={placeholder}
        onFocus={() => setIsOpen(inputValue !== '')}
        onKeyDown={generateHandleKeypressInput(suggestionListRef, () =>
          setIsOpen(false)
        )}
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
