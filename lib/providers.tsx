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
import OnboardingGate from '../components/OnboardingGate';

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
              <MeProvider>
                <OnboardingGate>{children}</OnboardingGate>
              </MeProvider>
            </SystemProvider>
          </SWRConfig>
        </SessionProvider>
      </ThemeProvider>
    </ThemeContextProvider>
  );
}
