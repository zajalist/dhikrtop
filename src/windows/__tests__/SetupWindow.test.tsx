import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SetupWindow from '../windows/setup/SetupWindow';

// Mock Tauri APIs
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(() => Promise.resolve()),
}));

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(() => ({
    close: vi.fn(() => Promise.resolve()),
  })),
}));

describe('SetupWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders setup window with welcome step', async () => {
    render(<SetupWindow />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to Dhikrtop')).toBeDefined();
      expect(screen.getByText(/Step 1 of 4/)).toBeDefined();
    });
  });

  it('displays close button', async () => {
    render(<SetupWindow />);

    await waitFor(() => {
      const closeBtn = screen.getByTitle('Close');
      expect(closeBtn).toBeDefined();
    });
  });

  it('shows features list on welcome step', async () => {
    render(<SetupWindow />);

    await waitFor(() => {
      expect(screen.getByText(/Intelligent reminders/)).toBeDefined();
      expect(screen.getByText(/Beautiful Quranic/)).toBeDefined();
    });
  });

  it('navigates through setup steps', async () => {
    const user = userEvent.setup();
    render(<SetupWindow />);

    // Step 1 - Welcome
    await waitFor(() => {
      expect(screen.getByText(/Step 1 of 4/)).toBeDefined();
    });

    // Click Next
    const nextBtn = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Next')
    );

    if (nextBtn) {
      await user.click(nextBtn);

      // Step 2 - Language & Display
      await waitFor(() => {
        expect(screen.getByText(/Step 2 of 4/)).toBeDefined();
      });
    }
  });

  it('shows Complete Setup button on final step', async () => {
    const user = userEvent.setup();
    render(<SetupWindow />);

    // Navigate to final step (step 3->step 4)
    let nextBtn = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Next')
    );

    for (let i = 0; i < 3; i++) {
      if (nextBtn) {
        await user.click(nextBtn);
        nextBtn = screen.getAllByRole('button').find(btn => 
          btn.textContent?.includes('Next')
        );
      }
    }

    await waitFor(() => {
      const completeBtn = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('Complete Setup')
      );
      expect(completeBtn).toBeDefined();
    });
  });

  it('disables buttons while loading', async () => {
    const user = userEvent.setup();
    render(<SetupWindow />);

    // Navigate to final step
    let nextBtn = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Next')
    );

    for (let i = 0; i < 3; i++) {
      if (nextBtn) {
        await user.click(nextBtn);
        nextBtn = screen.getAllByRole('button').find(btn => 
          btn.textContent?.includes('Next')
        );
      }
    }

    // Click Complete Setup
    const completeBtn = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Complete Setup')
    );

    if (completeBtn) {
      await user.click(completeBtn);

      await waitFor(() => {
        expect(completeBtn).toBeDisabled();
      });
    }
  });

  it('shows Back button on non-first steps', async () => {
    const user = userEvent.setup();
    render(<SetupWindow />);

    // Initially no back button
    expect(screen.queryByRole('button', { name: /Back/ })).toBeNull();

    // Click Next to go to step 2
    const nextBtn = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('Next')
    );

    if (nextBtn) {
      await user.click(nextBtn);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back/ })).toBeDefined();
      });
    }
  });
});
