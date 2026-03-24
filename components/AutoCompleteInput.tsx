import type {
  KeyboardEvent,
  ComponentType,
  InputHTMLAttributes,
  DetailedHTMLProps,
  RefObject,
} from 'react';
import { useState, useMemo, useRef, useEffect, forwardRef } from 'react';
import useDebounce from '../hooks/useDebounce';
import useClickAway from '../hooks/useClickAway';
import Fuse from 'fuse.js';
import { generateHandleClick } from '../helpers/handlers';
import classNames from '../helpers/classNames';
import styles from './AutoCompleteInput.module.css';

const DefaultInput = forwardRef<
  HTMLInputElement,
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
>((props, ref) => <input className={styles.input} {...props} ref={ref} />);
DefaultInput.displayName = 'DefaultInput';

const generateHandleKeypressInput =
  (listRef: RefObject<HTMLUListElement | null>, close: () => void) =>
  (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'Escape' && e.key !== 'Tab') {
      return;
    }

    if (e.shiftKey && e.key === 'Tab') {
      close();
      return;
    }

    e.preventDefault();
    if (e.key === 'Escape') {
      return close();
    }
    const span: HTMLSpanElement | null =
      listRef.current!.querySelector('li span');

    return span && span.focus();
  };

const generateHandleKeypressSpan =
  (
    changeFunc: (e: KeyboardEvent) => void,
    listRef: RefObject<HTMLUListElement | null>,
    inputRef: RefObject<HTMLInputElement | null>,
    close: () => void
  ) =>
  (e: KeyboardEvent) => {
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
      inputRef.current!.focus();
      return close();
    }

    if (e.key === 'Enter' || e.key === ' ') {
      changeFunc(e);
    } else {
      const focusedSpan: HTMLSpanElement | null =
        listRef.current!.querySelector('li span:focus');
      const spans: Array<HTMLSpanElement> = Array.from(
        listRef.current!.querySelectorAll('li span')
      );
      const currentIndex = spans.indexOf(focusedSpan!);
      if (e.key === 'ArrowDown') {
        if (spans.length > currentIndex + 1) {
          spans[currentIndex + 1]!.focus();
        }
      } else if (currentIndex > 0) {
        spans[currentIndex - 1]!.focus();
      } else {
        inputRef.current!.focus();
      }
    }
  };

type Props<T> = {
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
};

const AutoCompleteInput = <T extends Record<string, unknown>>({
  autocompleteOptions,
  onSubmit,
  display,
  baseValue = '',
  placeholder,
  searchKeys,
  StyledInput = DefaultInput,
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
  const [autocompleteMatchingOptions, setAutocompleteMatchingOptions] =
    useState<Array<T>>([]);
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

  const suggestionListRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    <form
      className="relative"
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
      <span
        className={classNames(
          styles.suggestionContainer,
          isOpen && autocompleteMatchingOptions.length > 0 ? 'open' : null
        )}
      >
        <ul className={styles.suggestionList} ref={suggestionListRef}>
          {autocompleteMatchingOptions.slice(0, 5).map((match, i) => {
            let displayName: string;
            if (typeof display === 'string') {
              displayName = String(match[display]);
            } else {
              displayName = display(match);
            }

            return (
              <li key={displayName} className={styles.suggestion}>
                <span
                  tabIndex={0}
                  onClick={clickHandler(match)}
                  onKeyDown={keyHandler(match)}
                  onBlur={() => {
                    if (
                      i >=
                      Math.min(
                        5,
                        autocompleteMatchingOptions.slice(0, 5).length
                      ) -
                        1
                    )
                      setIsOpen(false);
                  }}
                  role="button"
                >
                  {displayName}
                </span>
              </li>
            );
          })}
        </ul>
      </span>
    </form>
  );
};

export default AutoCompleteInput;
