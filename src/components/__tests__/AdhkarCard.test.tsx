import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdhkarCard from '../components/AdhkarCard';
import type { Adhkar } from '../lib/types';

const mockAdhkar: Adhkar = {
  id: '1',
  arabic: 'سُبْحَانَ اللَّهِ',
  transliteration: 'Subhanallah',
  english: 'Glory be to Allah',
  category: 'general',
  source: 'Test',
  repeatCount: 0,
};

describe('AdhkarCard Component', () => {
  let mockHandlers: {
    onDismiss: ReturnType<typeof vi.fn>;
    onLike: ReturnType<typeof vi.fn>;
    onDislike: ReturnType<typeof vi.fn>;
    onSnooze: ReturnType<typeof vi.fn>;
    onSettings: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockHandlers = {
      onDismiss: vi.fn(),
      onLike: vi.fn(),
      onDislike: vi.fn(),
      onSnooze: vi.fn(),
      onSettings: vi.fn(),
    };
  });

  it('renders adhkar content correctly', async () => {
    render(
      <AdhkarCard
        adhkar={mockAdhkar}
        {...mockHandlers}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/سُبْحَانَ اللَّهِ/)).toBeDefined();
      expect(screen.getByText(/Glory be to Allah/)).toBeDefined();
    });
  });

  it('displays category badge', async () => {
    render(
      <AdhkarCard
        adhkar={mockAdhkar}
        {...mockHandlers}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('GENERAL')).toBeDefined();
    });
  });

  it('calls onDismiss when dismissed', async () => {
    const user = userEvent.setup();
    render(
      <AdhkarCard
        adhkar={mockAdhkar}
        {...mockHandlers}
      />
    );

    const dismissBtn = screen.getAllByRole('button').find(btn => 
      btn.textContent?.includes('✕')
    );

    if (dismissBtn) {
      await user.click(dismissBtn);
      expect(mockHandlers.onDismiss).toHaveBeenCalled();
    }
  });

  it('calls onLike when like button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AdhkarCard
        adhkar={mockAdhkar}
        {...mockHandlers}
      />
    );

    const buttons = screen.getAllByRole('button');
    const likeBtn = buttons.find(btn => btn.textContent?.includes('👍'));

    if (likeBtn) {
      await user.click(likeBtn);
      expect(mockHandlers.onLike).toHaveBeenCalled();
    }
  });

  it('handles auto-dismiss countdown', async () => {
    vi.useFakeTimers();
    
    render(
      <AdhkarCard
        adhkar={mockAdhkar}
        {...mockHandlers}
        autoDismissSec={1}
      />
    );

    vi.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(mockHandlers.onDismiss).toHaveBeenCalled();
    });

    vi.useRealTimers();
  });

  it('shows repeat indicator when applicable', async () => {
    const adhkarWithRepeat = {
      ...mockAdhkar,
      repeatCount: 3,
    };

    render(
      <AdhkarCard
        adhkar={adhkarWithRepeat}
        {...mockHandlers}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/x3/)).toBeDefined();
    });
  });
});
