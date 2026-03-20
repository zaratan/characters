// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import ErrorPage from '../../components/ErrorPage';

const mockSignIn = vi.fn();

vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock('../../components/Nav', () => ({
  default: () => React.createElement('div', { 'data-testid': 'nav' }),
}));

vi.mock('../../components/Footer', () => ({
  default: () => React.createElement('div', { 'data-testid': 'footer' }),
}));

beforeEach(() => {
  mockSignIn.mockClear();
});

afterEach(() => {
  cleanup();
});

describe('ErrorPage', () => {
  it('renders the authorization error message', () => {
    renderWithProviders(<ErrorPage />);

    expect(
      screen.getByText(/vous n.êtes pas autorisé à voir cette page/i)
    ).toBeInTheDocument();
  });

  it('calls signIn when the login button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ErrorPage />);

    const loginButton = screen.getByRole('button', {
      name: /connectez-vous/i,
    });
    await user.click(loginButton);

    expect(mockSignIn).toHaveBeenCalledOnce();
  });

  it('renders Nav and Footer stubs', () => {
    renderWithProviders(<ErrorPage />);

    expect(screen.getByTestId('nav')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
