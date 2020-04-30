import styled from 'styled-components';

export const HorizontalSection = styled.div<{ count?: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.count || 3}, 1fr);
  column-gap: 50px;
  grid-auto-rows: auto;
  grid-row-gap: 2rem;

  @media screen and (max-width: 1304px) {
    grid-template-columns: repeat(min(${(props) => props.count || 2}, 2), auto);
  }

  @media screen and (max-width: 859px) {
    grid-template-columns: auto;
  }
`;
