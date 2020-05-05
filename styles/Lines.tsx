import styled from 'styled-components';

export const EmptyLine = styled.div`
  height: 3rem;
  display: flex;
  align-items: center;
  width: 100%;
  &.thin {
    height: 1rem;
  }
`;

export const BlackLine = styled.div`
  background-color: black;
  height: 3px;
  width: 100%;
  &.thin {
    height: 1px;
  }
`;
