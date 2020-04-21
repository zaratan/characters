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
  flex-grow: 1;
  :focus {
    outline: none;
  }
`;
