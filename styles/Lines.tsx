import styled from 'styled-components';

export const EmptyLine = styled.div`
  height: 3rem;
  display: flex;
  align-items: center;
  width: 100%;
  &.thin {
    height: 1rem;
  }
  &.mobile-only {
    @media screen and (min-width: 681px) {
      display: none;
    }
  }
`;

export const BlackLine = styled.div`
  background-color: ${(props) => props.theme.color};
  height: 3px;
  width: 100%;
  &.thin {
    height: 1px;
  }
  &.mobile-only {
    @media screen and (min-width: 681px) {
      display: none;
    }
  }
`;
