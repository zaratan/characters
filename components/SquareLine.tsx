// □

// ▢
import React, { useState } from 'react';
import Square from './Square';

const SquareLine = () => {
  const [checkedSquare, setCheckedSquare] = useState(false);
  return (
    <div>
      <Square
        checked={checkedSquare}
        onClick={() => {
          setCheckedSquare(!checkedSquare);
        }}
      />
    </div>
  );
};

export default SquareLine;
