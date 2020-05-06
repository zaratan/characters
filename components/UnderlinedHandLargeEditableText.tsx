import React, { FormEvent } from 'react';
import { HandLargeEditableText, HandLargeText } from '../styles/Texts';
import { BlackLine, EmptyLine } from '../styles/Lines';
import { TempElemType } from '../types/TempElemType';

const UnderlinedHandLargeEditableText = ({
  elem,
  inactive,
}: {
  elem: TempElemType<string>;
  inactive?: boolean;
}) => (
  <div>
    {inactive ? (
      <HandLargeText className="left-padded">{elem.value}</HandLargeText>
    ) : (
      <HandLargeEditableText
        onChange={(e: FormEvent<HTMLInputElement>) => {
          elem.set(e.currentTarget.value);
        }}
        value={elem.value}
        type="text"
        className="left-padded"
      />
    )}
    <BlackLine className="thin" />
    <EmptyLine className="thin" />
  </div>
);

export default UnderlinedHandLargeEditableText;
