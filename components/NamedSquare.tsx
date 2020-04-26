import React, { useState } from 'react';
import styled from 'styled-components';
import Square, { EmptyGlyph } from './Square';
import { SubTitle } from '../styles/Titles';

const NamedSquareContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 3rem;
  @media screen and (max-width: 400px) {
    padding: 0;
  }
`;

const Separator = styled.span`
  width: 4rem;
`;

const Container = styled.span`
  display: flex;
  justify-content: space-between;
  width: 70%;
`;

const NamedSquare = ({
  value,
  title,
  subtitle,
  setValue,
}: {
  value: number;
  title: string;
  subtitle?: string;
  setValue: (value: number) => void;
}) => {
  const changeValue = () => {
    setValue(value < 3 ? value + 1 : 3);
  };
  return (
    <NamedSquareContainer>
      <Container>
        <SubTitle>{title}</SubTitle>
        <Separator />
        <span>{subtitle}</span>
      </Container>
      <span style={{ position: 'relative' }}>
        <EmptyGlyph
          type={title}
          onClick={() => setValue(0)}
          inactive={value === 0}
        />
        <Square
          checked={value}
          onClick={changeValue}
          inactive={value === 3}
          name={`${title}`}
        />
      </span>
    </NamedSquareContainer>
  );
};

export default NamedSquare;
