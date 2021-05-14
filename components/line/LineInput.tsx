import React from 'react';
import { HandEditableText } from '../../styles/Texts';
import AutoCompleteInput from '../AutoCompleteInput';

interface InputProps<T> {
  changeName?: (newValue: string) => void;
  title?: string;
  placeholder?: string;
  autocomplete?: Array<T>;
}

const LineInput = <T extends { name: string }>({
  autocomplete,
  placeholder,
  title,
  changeName,
}: InputProps<T>) => {
  if (autocomplete && autocomplete.length > 0) {
    const onSubmit = (e: string | T) => {
      changeName(typeof e === 'string' ? e : e.name);
    };
    return (
      <AutoCompleteInput
        autocompleteOptions={autocomplete}
        baseValue={title}
        searchKeys={['name']}
        display="name"
        placeholder={placeholder}
        onSubmit={onSubmit}
        StyledInput={HandEditableText}
      />
    );
  }
  return (
    <HandEditableText
      value={title}
      onChange={(e) => changeName(e.currentTarget.value)}
      placeholder={placeholder || 'Nouveau Nom…'}
    />
  );
};

export default LineInput;
