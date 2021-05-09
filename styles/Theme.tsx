import React, { ReactNode, useContext } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import ThemeContext from '../contexts/ThemeContext';

export const lightTheme = {
  background: 'white',
  color: 'black',
  dotColor: 'black',
  borderColor: 'lightgray',
  actionItemBorderColor: '#ccc',
  actionItemBackgroundActive: '#f7f7f7',
  focusBorderColor: '#8bcbe0',
  focusBackgroundColor: '#b4dae7',
  hoverBackgroundColor: '#8bcbe0',
  actionBackground: '#eee',
  glyphGray: '#555',
  blue: '#1e4ed1',
  navBackground: '#f8f8f8',
  handTextColor: '#333',
  dotBaseNotSelectColot: '#bbb',
  titleColor: 'gray',
  red: 'red',
};

export const darkTheme = {
  background: '#333',
  color: '#ccc',
  dotColor: '#aaa',
  borderColor: 'darkGray',
  actionItemBorderColor: '#666',
  actionItemBackgroundActive: '#555',
  focusBorderColor: '#8bcbe0',
  focusBackgroundColor: '#1d718d',
  hoverBackgroundColor: '#1b5c72',
  actionBackground: '#444',
  glyphGray: '#999',
  blue: '#1e4ed1',
  navBackground: '#070707',
  handTextColor: '#bbb',
  dotBaseNotSelectColot: '#fff',
  titleColor: '#ccc',
  red: '#e62a2a',
};

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <StyledThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      {children}
    </StyledThemeProvider>
  );
};

export default ThemeProvider;
