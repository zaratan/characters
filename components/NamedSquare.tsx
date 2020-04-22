import React, { useState } from 'react';
import styled from 'styled-components';
import Square from './Square';
import { SubTitle } from '../styles/Titles';

const NamedSquareContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 3rem;
`;

const Separator = styled.span`
  width: 4rem;
`;

const Container = styled.span`
  display: flex;
  justify-content: space-between;
  width: 70%;
`;

const AloneSquare = styled(Square)``;

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
    setValue((value + 1) % 4);
  };
  return (
    <NamedSquareContainer>
      <Container>
        <SubTitle>{title}</SubTitle>
        <Separator />
        <span>{subtitle}</span>
      </Container>
      <AloneSquare checked={value} onClick={changeValue} />
    </NamedSquareContainer>
  );
};

export default NamedSquare;
