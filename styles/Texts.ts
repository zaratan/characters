import styled from 'styled-components';

export const HandLargeText = styled.span`
  font-family: 'Bilbo Swash Caps', cursive;
  font-size: 2rem;
  color: #333;
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

export const HandEditableText = styled.input`
  font-family: 'Bilbo Swash Caps', cursive;
  font-size: 1.5rem;
  color: #333;
  border: none;
  flex-shrink: 1;
  flex-grow: 1;
  min-width: 0;
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
