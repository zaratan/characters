import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
html, body, #__next {
  min-height: 100%;
  height: 100%;
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color}
}

a {
  text-decoration: none;
  color: ${(props) => props.theme.color};
  transition: color 0.2s ease-in-out;

  &:hover {
    color: darkcyan;
  }
}
`;

export default GlobalStyle;
