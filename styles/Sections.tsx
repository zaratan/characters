import styled from 'styled-components';

export const HorizontalSection = styled.div<{ count?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.count || 3}, auto);
  column-gap: 50px;
  grid-auto-rows: auto;

  @media screen and (max-width: 1260px) {
    grid-template-columns: repeat(min(${props => props.count || 2}, 2), auto);
  }

  @media screen and (max-width: 840px) {
    grid-template-columns: auto;
  }
`;
