import {} from 'styled-components';
import type { lightTheme } from './styles/Theme';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ThemeType extends ReturnType<() => typeof lightTheme> {}
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface DefaultTheme extends ThemeType {}
}
