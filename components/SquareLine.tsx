import React, { useState } from 'react';
import styled from 'styled-components';
import Square, { EmptyGlyph } from './Square';
import { TempElemType } from '../types/TempElemType';

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
  position: relative;
  width: fit-content;
  margin: 0 auto;
  &.must-wrap {
    display: grid;
    grid-template-columns:
      repeat(5, 24px) 0.6rem
      repeat(5, 24px) 0.6rem
      repeat(5, 24px);
    width: calc(15 * 24px + 1.2rem);
    margin: 0 auto;
    @media screen and (max-width: 500px) {
      grid-template-columns:
        repeat(5, 24px) 0.6rem
        repeat(5, 24px);
      width: calc(10 * 24px + 0.6rem);
    }
  }
  :not(.must-wrap) {
    display: flex;
    justify-content: center;
  }
`;

const Container = styled.div`
  position: relative;
`;

const SquareLine = ({
  type,
  number,
  numberChecked,
}: {
  type: string;
  number: number;
  numberChecked: TempElemType<number>;
}) => (
  <Container>
    <SquareLineContainer className={number > 15 ? 'must-wrap' : ''}>
      <EmptyGlyph
        type={type}
        onClick={() => numberChecked.set(0)}
        inactive={numberChecked.value === 0}
      />
      {Array.from(Array(number)).map((_, i) => [
        <Square
          checked={i < numberChecked.value}
          onClick={() => {
            numberChecked.set(i + 1);
          }}
          name={`${type} ${i}`}
          inactive={i + 1 === numberChecked.value}
          key={`${type} ${i}`}
        />,
        i % 5 === 4 && i !== number - 1 ? (
          <SquareSeparator
            className={`
              ${i % 10 === 9 ? 'xs-invisible' : ''} 
              ${i % 15 === 14 ? 'xs-visible' : ''}
              `}
            key={`type-${i}`}
          />
        ) : null,
      ])}
    </SquareLineContainer>
  </Container>
);

export default SquareLine;
