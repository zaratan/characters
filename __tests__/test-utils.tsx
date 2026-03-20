import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme } from '../styles/Theme';
import MeContext from '../contexts/MeContext';
import SystemContext from '../contexts/SystemContext';
import { ToastProvider } from '../contexts/ToastContext';
import type { MeType } from '../types/MeType';

export const mockMe = (overrides?: Partial<MeType>): MeType => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  image: '',
  isAdmin: false,
  hasOnboarded: true,
  ...overrides,
});

export const mockSession = (overrides?: Partial<MeType>): { user: MeType } => ({
  user: mockMe(overrides),
});

type ProviderOptions = {
  me?: {
    connected?: boolean;
    me?: MeType;
  };
  system?: {
    appId?: string;
  };
};

function AllProviders({
  children,
  options = {},
}: {
  children: ReactNode;
  options?: ProviderOptions;
}) {
  const meValue = {
    me: options.me?.me ?? mockMe(),
    connected: options.me?.connected ?? true,
    loading: false,
  };

  const systemValue = {
    appId: options.system?.appId ?? 'test-app-id',
    pusherClient: undefined,
    pusherState: undefined,
    needPusherFallback: false,
  };

  return (
    <StyledThemeProvider theme={lightTheme}>
      <MeContext.Provider value={meValue}>
        <SystemContext.Provider value={systemValue}>
          <ToastProvider>{children}</ToastProvider>
        </SystemContext.Provider>
      </MeContext.Provider>
    </StyledThemeProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: ProviderOptions & { renderOptions?: Omit<RenderOptions, 'wrapper'> }
) {
  const { renderOptions, ...providerOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders options={providerOptions}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

export { render, screen, waitFor, act, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
