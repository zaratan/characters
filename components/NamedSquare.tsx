import React, { useState } from 'react';
import Square from './Square';

const NamedSquare = ({ value }: { value: number }) => {
  const [localValue, setLocalValue] = useState(value);
  const changeValue = () => {
    setLocalValue((localValue + 1) % 4);
  };
  return (
    <div>
      <Square checked={localValue} onClick={changeValue} />
    </div>
  );
};

export default NamedSquare;
