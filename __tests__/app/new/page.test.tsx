// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils';
import NewCharPage from '../../../app/new/page';

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetcher = vi.fn();

vi.mock('../../../helpers/fetcher', () => ({
  fetcher: (...args: unknown[]) => mockFetcher(...args),
}));

vi.mock('../../../components/Nav', () => ({
  default: () => React.createElement('div', { 'data-testid': 'nav' }),
}));

vi.mock('../../../components/Footer', () => ({
  default: () => React.createElement('div', { 'data-testid': 'footer' }),
}));

// next-auth/react is used indirectly by ErrorPage (which is rendered when not connected)
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockPush.mockClear();
  mockFetcher.mockClear();
});

afterEach(() => {
  cleanup();
});

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe('NewCharPage', () => {
  it('shows error page content when user is not connected', () => {
    renderWithProviders(<NewCharPage />, { me: { connected: false } });

    // ErrorPage renders the authorization message
    expect(
      screen.getByText(/vous n.êtes pas autorisé à voir cette page/i)
    ).toBeInTheDocument();
    // The creation form should not be present
    expect(
      screen.queryByPlaceholderText(/nom du personnage/i)
    ).not.toBeInTheDocument();
  });

  it('renders the creation form when user is connected', () => {
    renderWithProviders(<NewCharPage />, { me: { connected: true } });

    expect(
      screen.getByPlaceholderText(/nom du personnage/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer/i })).toBeInTheDocument();
  });

  it('disables submit button when name is empty', () => {
    renderWithProviders(<NewCharPage />, { me: { connected: true } });

    const button = screen.getByRole('button', { name: /créer/i });
    expect(button).toBeDisabled();
  });

  it('enables submit button when name has text', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewCharPage />, { me: { connected: true } });

    const nameInput = screen.getByPlaceholderText(/nom du personnage/i);
    await user.type(nameInput, 'Dracula');

    const button = screen.getByRole('button', { name: /créer/i });
    expect(button).not.toBeDisabled();
  });

  it('calls fetcher with correct URL and body, then navigates on success', async () => {
    const user = userEvent.setup();
    mockFetcher.mockResolvedValueOnce({ id: 'vampire-42' });

    renderWithProviders(<NewCharPage />, {
      me: { connected: true },
      system: { appId: 'test-app-id' },
    });

    const nameInput = screen.getByPlaceholderText(/nom du personnage/i);
    await user.type(nameInput, 'Lestat');

    const button = screen.getByRole('button', { name: /créer/i });
    await user.click(button);

    await waitFor(() => expect(mockFetcher).toHaveBeenCalled());

    expect(mockFetcher).toHaveBeenCalledWith('/api/vampires/create', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Lestat',
        era: 0,
        type: 0,
        appId: 'test-app-id',
        privateSheet: false,
      }),
    });

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/vampires/vampire-42')
    );
  });

  it('shows error message when fetcher throws', async () => {
    const user = userEvent.setup();
    mockFetcher.mockRejectedValueOnce(new Error('server error'));

    renderWithProviders(<NewCharPage />, { me: { connected: true } });

    const nameInput = screen.getByPlaceholderText(/nom du personnage/i);
    await user.type(nameInput, 'Louis');

    const button = screen.getByRole('button', { name: /créer/i });
    await user.click(button);

    await waitFor(() =>
      expect(
        screen.getByText(/une erreur est survenue lors de la création/i)
      ).toBeInTheDocument()
    );
  });

  it('calls fetcher with era:1 when Victorien era is selected', async () => {
    const user = userEvent.setup();
    mockFetcher.mockResolvedValueOnce({ id: 'vampire-era' });

    renderWithProviders(<NewCharPage />, {
      me: { connected: true },
      system: { appId: 'test-app-id' },
    });

    const nameInput = screen.getByPlaceholderText(/nom du personnage/i);
    await user.type(nameInput, 'AncientOne');

    const eraSelect = screen.getByRole('combobox', { name: /époque/i });
    await user.selectOptions(eraSelect, '1');

    const button = screen.getByRole('button', { name: /créer/i });
    await user.click(button);

    await waitFor(() => expect(mockFetcher).toHaveBeenCalled());

    expect(mockFetcher).toHaveBeenCalledWith('/api/vampires/create', {
      method: 'POST',
      body: JSON.stringify({
        name: 'AncientOne',
        era: 1,
        type: 0,
        appId: 'test-app-id',
        privateSheet: false,
      }),
    });
  });

  it('calls fetcher with type:1 when Humain type is selected', async () => {
    const user = userEvent.setup();
    mockFetcher.mockResolvedValueOnce({ id: 'vampire-type' });

    renderWithProviders(<NewCharPage />, {
      me: { connected: true },
      system: { appId: 'test-app-id' },
    });

    const nameInput = screen.getByPlaceholderText(/nom du personnage/i);
    await user.type(nameInput, 'MortalOne');

    const typeSelect = screen.getByRole('combobox', { name: /type/i });
    await user.selectOptions(typeSelect, '1');

    const button = screen.getByRole('button', { name: /créer/i });
    await user.click(button);

    await waitFor(() => expect(mockFetcher).toHaveBeenCalled());

    expect(mockFetcher).toHaveBeenCalledWith('/api/vampires/create', {
      method: 'POST',
      body: JSON.stringify({
        name: 'MortalOne',
        era: 0,
        type: 1,
        appId: 'test-app-id',
        privateSheet: false,
      }),
    });
  });

  it('disables submit button during save (showing Création... label)', async () => {
    const user = userEvent.setup();
    // Never resolves — keeps the component in saving state
    mockFetcher.mockReturnValueOnce(new Promise(() => {}));

    renderWithProviders(<NewCharPage />, { me: { connected: true } });

    const nameInput = screen.getByPlaceholderText(/nom du personnage/i);
    await user.type(nameInput, 'Armand');

    const button = screen.getByRole('button', { name: /créer/i });
    await user.click(button);

    // While saving, the button value changes to "Création..." and becomes disabled
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /création/i })).toBeDisabled()
    );
  });
});
