import styled from 'styled-components';

export const HandLargeText = styled.span`
  font-family: 'Bilbo Swash Caps', cursive;
  font-size: 2rem;
  color: #333;
  &.left-padded {
    padding-left: 2rem;
  }
  &.label {
    @media screen and (max-width: 500px) {
      padding-left: 2rem;
      width: 100%;
    }
  }
`;

export const HandLargeEditableText = styled.input`
  font-family: 'Bilbo Swash Caps', cursive;
  font-size: 2rem;
  color: #333;
  border: none;
  flex-shrink: 1;
  flex-grow: 1;
  min-width: 0;
  text-indent: 1px;
  :focus {
    outline: none;
  }
  @media screen and (max-width: 500px) {
    padding-left: 2rem;
    width: 100%;
  }
  &.left-padded {
    padding-left: 2rem;
  }
`;

export const HandText = styled.span`
  font-family: 'Bilbo Swash Caps', cursive;
  font-size: 1.5rem;
  color: #333;
  border: none;
  border-bottom: 1px solid black;
  flex-shrink: 1;
  flex-grow: 1;
  min-width: 70px;
  text-indent: 1px;
  &.low {
    font-size: 1.2rem;
  }
  :focus {
    outline: none;
  }
  @media screen and (max-width: 500px) {
    text-align: center;
    width: 100%;
  }
  &.left-padded {
    padding-left: 2rem;
  }
  &.small {
    max-width: 5rem;
    width: 100%;
  }
  &.very-small {
    font-size: 1rem;
    width: 1rem;
    min-width: 0;
    appearance: none;
    display: inline-block;
  }
`;

export const HandEditableText = styled.input`
  font-family: 'Bilbo Swash Caps', cursive;
  font-size: 1.5rem;
  color: #333;
  border: none;
  border-bottom: 1px solid black;
  flex-shrink: 1;
  flex-grow: 1;
  min-width: 70px;
  text-indent: 1px;
  &.low {
    font-size: 1.2rem;
  }
  :focus {
    outline: none;
  }
  @media screen and (max-width: 500px) {
    text-align: center;
    width: 100%;
  }
  &.left-padded {
    padding-left: 2rem;
  }
  &.small {
    max-width: 5rem;
  }
  &.very-small {
    font-size: 1rem;
    width: 1rem;
    min-width: 0;
    appearance: none;
  }
`;
