import React, { FormEvent, useState } from 'react';
import { HandLargeEditableText } from '../styles/Texts';
import { BlackLine, EmptyLine } from '../styles/Lines';

const UnderlinedHandLargeEditableText = ({ value }: { value: string }) => {
  const [localValue, setLocalValue] = useState(value);
  return (
    <div>
      <HandLargeEditableText
        onChange={(e: FormEvent<HTMLInputElement>) => {
          setLocalValue(e.currentTarget.value);
        }}
        value={localValue}
        type="text"
        className="left-padded"
      />
      <BlackLine className="thin" />
      <EmptyLine className="thin" />
    </div>
  );
};

export default UnderlinedHandLargeEditableText;
