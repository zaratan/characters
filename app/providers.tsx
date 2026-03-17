'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import { ThemeContextProvider } from '../contexts/ThemeContext';
import ThemeProvider from '../styles/Theme';
import GlobalStyle from '../styles/GlobalStyle';
import { fetcher } from '../helpers/fetcher';
import { SystemProvider } from '../contexts/SystemContext';
import { MeProvider } from '../contexts/MeContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeContextProvider>
      <ThemeProvider>
        <SessionProvider>
          <SWRConfig
            value={{
              fetcher,
            }}
          >
            <GlobalStyle />
            <SystemProvider>
              <MeProvider>{children}</MeProvider>
            </SystemProvider>
          </SWRConfig>
        </SessionProvider>
      </ThemeProvider>
    </ThemeContextProvider>
  );
}
