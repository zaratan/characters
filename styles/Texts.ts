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
  :focus {
    outline: none;
  }
  @media screen and (max-width: 500px) {
    width: 100%;
  }
`;
