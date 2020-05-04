import styled from 'styled-components';

export const Container = styled.div`
  .col-button {
    font-size: 1.5rem;
    height: 100%;
    display: flex;
    align-items: center;
  }
  @media screen and (any-hover: hover) {
    .empty-glyph,
    .open-glyph,
    .line-button,
    .remove-glyph,
    .ritual-multiplicator,
    .col-button {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }
    :hover,
    :focus-within {
      .empty-glyph,
      .open-glyph,
      .line-button,
      .remove-glyph,
      .ritual-multiplicator,
      .col-button {
        opacity: 1;
      }
    }
  }
`;
