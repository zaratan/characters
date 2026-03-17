import styled from 'styled-components';

const TextFallback = styled.strong`
  height: 100%;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  a {
    margin-left: 0.25rem;
    text-decoration: underline;
  }
`;

export default TextFallback;
