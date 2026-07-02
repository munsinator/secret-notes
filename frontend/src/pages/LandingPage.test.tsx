import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingPage } from './LandingPage';

const captureMock = vi.fn();
const onFeatureFlagsMock = vi.fn();
const isFeatureEnabledMock = vi.fn();

vi.mock('../lib/posthog', () => ({
  getPostHog: () => ({
    capture: captureMock,
    onFeatureFlags: onFeatureFlagsMock,
    isFeatureEnabled: isFeatureEnabledMock,
  }),
}));

function mockFetchOnce(response: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValueOnce({
      ok,
      json: async () => response,
    })
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isFeatureEnabledMock.mockReturnValue(false);
    onFeatureFlagsMock.mockImplementation((callback: () => void) => callback());
  });

  test('renders the page title', () => {
    render(<LandingPage />);

    expect(screen.getByRole('heading', { name: /secret notes/i })).toBeInTheDocument();
  });

  test('renders create note form', () => {
    render(<LandingPage />);

    expect(screen.getByLabelText(/^note$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^encryption key$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create note/i })).toBeInTheDocument();
  });

  test('renders read note form', () => {
    render(<LandingPage />);

    expect(screen.getByLabelText(/^note id$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^decryption key$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /read note/i })).toBeInTheDocument();
  });

  test('shows validation message when creating an empty note', async () => {
    const user = userEvent.setup();
    render(<LandingPage />);

    await user.click(screen.getByRole('button', { name: /create note/i }));

    expect(screen.getByText(/write a note before creating it/i)).toBeInTheDocument();
  });

  test('shows validation message when creating without key', async () => {
    const user = userEvent.setup();
    render(<LandingPage />);

    await user.type(screen.getByLabelText(/^note$/i), 'My secret note');
    await user.click(screen.getByRole('button', { name: /create note/i }));

    expect(screen.getByText(/enter an encryption key/i)).toBeInTheDocument();
  });

  test('creates a note and shows returned note id', async () => {
    const user = userEvent.setup();
    mockFetchOnce({ id: 'note-123' });

    render(<LandingPage />);

    await user.type(screen.getByLabelText(/^note$/i), 'My secret note');
    await user.type(screen.getByLabelText(/^encryption key$/i), 'test123');
    await user.click(screen.getByRole('button', { name: /create note/i }));

    await waitFor(() => {
      expect(screen.getByText(/note created securely/i)).toBeInTheDocument();
    });

    expect(screen.getByText('note-123')).toBeInTheDocument();
    expect(captureMock).toHaveBeenCalledWith('create_note_clicked');
    expect(captureMock).toHaveBeenCalledWith('note_created', { note_id: 'note-123' });
  });

  test('shows backend error when note creation fails', async () => {
    const user = userEvent.setup();
    mockFetchOnce({ error: 'Database unavailable' }, false);

    render(<LandingPage />);

    await user.type(screen.getByLabelText(/^note$/i), 'My secret note');
    await user.type(screen.getByLabelText(/^encryption key$/i), 'test123');
    await user.click(screen.getByRole('button', { name: /create note/i }));

    await waitFor(() => {
      expect(screen.getByText(/database unavailable/i)).toBeInTheDocument();
    });
  });

  test('shows validation message when reading without note id', async () => {
    const user = userEvent.setup();
    render(<LandingPage />);

    await user.click(screen.getByRole('button', { name: /read note/i }));

    expect(screen.getByText(/enter a note id/i)).toBeInTheDocument();
  });

  test('reads and displays a decrypted note', async () => {
    const user = userEvent.setup();
    mockFetchOnce({ id: 'note-123', note: 'Decrypted text' });

    render(<LandingPage />);

    await user.type(screen.getByLabelText(/^note id$/i), 'note-123');
    await user.type(screen.getByLabelText(/^decryption key$/i), 'test123');
    await user.click(screen.getByRole('button', { name: /read note/i }));

    await waitFor(() => {
      expect(screen.getByText(/decrypted text/i)).toBeInTheDocument();
    });

    expect(captureMock).toHaveBeenCalledWith('read_note_clicked');
    expect(captureMock).toHaveBeenCalledWith('note_decrypted', { note_id: 'note-123' });
  });

  test('tracks failed decryption when backend rejects the key', async () => {
    const user = userEvent.setup();
    mockFetchOnce({ error: 'invalid key' }, false);

    render(<LandingPage />);

    await user.type(screen.getByLabelText(/^note id$/i), 'note-123');
    await user.type(screen.getByLabelText(/^decryption key$/i), 'wrongkey');
    await user.click(screen.getByRole('button', { name: /read note/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid key/i)).toBeInTheDocument();
    });

    expect(captureMock).toHaveBeenCalledWith('note_decryption_failed', {
      note_id: 'note-123',
    });
  });

  test('shows PostHog feature flag badge when new UI is enabled', () => {
    isFeatureEnabledMock.mockReturnValue(true);

    render(<LandingPage />);

    expect(
      screen.getByText(/new ui enabled by posthog feature flag/i)
    ).toBeInTheDocument();
  });
});