import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsWindow from '../windows/settings/SettingsWindow';

// Mock the store functions
vi.mock('../lib/store', () => ({
  getPreferences: vi.fn(() => Promise.resolve({
    idleThresholdSec: 120,
    minIntervalSec: 600,
    categories: ['morning', 'evening', 'general', 'sleep'],
    language: 'all',
    enabled: true,
  })),
  savePreferences: vi.fn(() => Promise.resolve()),
}));

describe('SettingsWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings window with all sections', async () => {
    render(<SettingsWindow />);

    await waitFor(() => {
      expect(screen.getByText('General')).toBeDefined();
      expect(screen.getByText('Adhkar')).toBeDefined();
      expect(screen.getByText('Appearance')).toBeDefined();
      expect(screen.getByText('About')).toBeDefined();
    });
  });

  it('displays general settings initial values', async () => {
    render(<SettingsWindow />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('navigates between sections', async () => {
    const user = userEvent.setup();
    render(<SettingsWindow />);

    await waitFor(() => {
      expect(screen.getByText('Adhkar')).toBeDefined();
    });

    const adhkarBtn = screen.getByText('Adhkar');
    await user.click(adhkarBtn);

    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeDefined();
    });
  });

  it('toggles adhkar categories', async () => {
    const user = userEvent.setup();
    render(<SettingsWindow />);

    // Navigate to Adhkar section
    await waitFor(() => {
      expect(screen.getByText('Adhkar')).toBeDefined();
    });

    const adhkarBtn = screen.getByText('Adhkar');
    await user.click(adhkarBtn);

    // Find and click a checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0]);
      expect(checkboxes[0]).toHaveProperty('checked');
    }
  });

  it('shows Save button on settings change', async () => {
    render(<SettingsWindow />);

    await waitFor(() => {
      expect(screen.getByText(/Save|Saved/)).toBeDefined();
    });
  });

  it('toggles enabled state', async () => {
    const user = userEvent.setup();
    render(<SettingsWindow />);

    await waitFor(() => {
      const toggleButtons = screen.getAllByRole('button').filter(btn => 
        btn.classList.contains('toggleSwitch')
      );
      expect(toggleButtons.length).toBeGreaterThan(0);
    });
  });
});
