import {} from 'styled-components';
import { lightTheme } from './styles/Theme';

declare module 'styled-components' {
  type ThemeType = typeof lightTheme;
  export interface DefaultTheme extends ThemeType {}
}
