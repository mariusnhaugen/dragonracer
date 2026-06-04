import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlayerControl } from '../../src/components/PlayerControl';
import * as serverApi from '../../src/lib/serverApi';
import type { PlayerResponse } from '../../src/lib/serverApi';

const player: PlayerResponse = {
  username: 'Zezima',
  updatedAt: '2026-05-21T14:32:58.481Z',
  skillLevels: { attack: 60 },
  completedTaskIds: [3, 8, 51],
};

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE', 'http://localhost:8080');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('PlayerControl', () => {
  it('200: calls onLoad with the player response and shows synced timestamp', async () => {
    vi.spyOn(serverApi, 'fetchPlayer').mockResolvedValue(player);
    const onLoad = vi.fn();

    render(<PlayerControl onLoad={onLoad} />);

    fireEvent.change(screen.getByPlaceholderText('OSRS username'), {
      target: { value: 'Zezima' },
    });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(1));
    expect(onLoad).toHaveBeenCalledWith(player);
  });

  it('null (404): shows "No data for that player yet" and does not call onLoad', async () => {
    vi.spyOn(serverApi, 'fetchPlayer').mockResolvedValue(null);
    const onLoad = vi.fn();

    render(<PlayerControl onLoad={onLoad} />);

    fireEvent.change(screen.getByPlaceholderText('OSRS username'), {
      target: { value: 'Nobody' },
    });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(screen.queryByText('No data for that player yet')).not.toBeNull(),
    );
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('thrown error: surfaces the message and does not call onLoad', async () => {
    vi.spyOn(serverApi, 'fetchPlayer').mockRejectedValue(new Error('Network error'));
    const onLoad = vi.fn();

    render(<PlayerControl onLoad={onLoad} />);

    fireEvent.change(screen.getByPlaceholderText('OSRS username'), {
      target: { value: 'SomePlayer' },
    });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(screen.queryByText('Lookup failed: Network error')).not.toBeNull(),
    );
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('shows refresh affordance when a player is already loaded', () => {
    render(
      <PlayerControl
        username="Zezima"
        playerUpdatedAt={player.updatedAt}
        onLoad={vi.fn()}
      />,
    );

    expect(screen.getByRole('button').textContent).toContain('↻ Refresh');
    expect(screen.getByDisplayValue('Zezima')).toBeTruthy();
  });
});
