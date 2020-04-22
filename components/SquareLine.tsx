import React, { useState } from 'react';
import styled from 'styled-components';
import Square from './Square';

const SquareSeparator = styled.span`
  padding: 0.3rem;
  height: 100%;
  outline: none;
  &.xs-visible {
    display: none;
  }
  @media screen and (max-width: 500px) {
    &.xs-visible {
      display: inherit;
    }
    &.xs-invisible {
      display: none;
    }
  }
`;

const SquareLineContainer = styled.div`
  &.must-wrap {
    display: grid;
    grid-template-columns:
      repeat(5, 24px) 0.3rem
      repeat(5, 24px) 0.3rem
      repeat(5, 24px);
    width: calc(15 * 24px + 0.6rem);
    margin: 0 auto;
    @media screen and (max-width: 500px) {
      grid-template-columns:
        repeat(5, 24px) 0.3rem
        repeat(5, 24px);
      width: calc(10 * 24px + 0.3rem);
    }
  }
  :not(.must-wrap) {
    display: flex;
    justify-content: center;
  }
`;

const SquareLine = ({
  number,
  numberChecked,
}: {
  number: number;
  numberChecked: number;
}) => {
  const [localNumberChecked, setLocalNumberChecked] = useState(numberChecked);
  return (
    <SquareLineContainer className={number > 15 ? 'must-wrap' : ''}>
      {Array.from(Array(number)).map((_, i) => (
        <>
          <Square
            checked={i < localNumberChecked}
            onClick={() => {
              setLocalNumberChecked(i + 1);
            }}
          />
          {i % 5 === 4 && i !== number - 1 ? (
            <SquareSeparator
              className={`
              ${i % 10 === 9 ? 'xs-invisible' : ''} 
              ${i % 15 === 14 ? 'xs-visible' : ''}
              `}
            />
          ) : null}
        </>
      ))}
    </SquareLineContainer>
  );
};

export default SquareLine;
