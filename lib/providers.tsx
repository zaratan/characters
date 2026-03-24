'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import { ThemeContextProvider } from '../contexts/ThemeContext';
import { fetcher } from '../helpers/fetcher';
import { SystemProvider } from '../contexts/SystemContext';
import { MeProvider } from '../contexts/MeContext';
import { ToastProvider } from '../contexts/ToastContext';
import OnboardingGate from '../components/OnboardingGate';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeContextProvider>
      <SessionProvider>
        <SWRConfig
          value={{
            fetcher,
          }}
        >
          <ToastProvider>
            <SystemProvider>
              <MeProvider>
                <OnboardingGate>{children}</OnboardingGate>
              </MeProvider>
            </SystemProvider>
          </ToastProvider>
        </SWRConfig>
      </SessionProvider>
    </ThemeContextProvider>
  );
}
