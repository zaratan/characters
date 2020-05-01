import styled from 'styled-components';

export const Title = styled.h1`
  font-family: CloisterBlack;
`;

export const SectionTitle = styled(Title)`
  padding: 0 1rem;
`;

export const ColumnTitle = styled(Title)`
  position: relative;
  margin: 0 auto;
  width: fit-content;
  @media screen and (max-width: 500px) {
    max-width: 70%;
  }
`;

export const SubTitle = styled.h2`
  font-family: CloisterBlack;
  color: gray;
  display: inline;
  white-space: nowrap;
`;
