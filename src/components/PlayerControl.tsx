import { useState, useRef } from 'react';
import { fetchPlayer } from '../lib/serverApi';
import type { PlayerResponse } from '../lib/serverApi';

interface PlayerControlProps {
  username?: string;
  playerUpdatedAt?: string;
  onLoad: (player: PlayerResponse) => void;
}

const VALID_USERNAME = /^[A-Za-z0-9_ ]*$/;

export function PlayerControl({ username, playerUpdatedAt, onLoad }: PlayerControlProps) {
  const [field, setField] = useState(username ?? '');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasPlayer = Boolean(username);
  const trimmed = field.trim();
  const isValid = trimmed.length > 0 && VALID_USERNAME.test(trimmed);

  async function handleLookup() {
    if (!isValid || loading) return;
    setLoading(true);
    setNotFound(false);
    setError(null);
    try {
      const result = await fetchPlayer(trimmed);
      if (result === null) {
        setNotFound(true);
      } else {
        onLoad(result);
        setField(result.username);
        setNotFound(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleLookup();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={field}
          maxLength={12}
          placeholder="OSRS username"
          onChange={e => {
            const val = e.target.value;
            if (VALID_USERNAME.test(val)) {
              setField(val);
              setNotFound(false);
              setError(null);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="px-2 py-1 text-xs rounded border border-wiki-raised bg-wiki-bg text-wiki-text placeholder-gray-600 focus:outline-none focus:border-amber-500 disabled:opacity-50 w-36"
        />
        <button
          onClick={handleLookup}
          disabled={!isValid || loading}
          className="px-3 py-1 text-xs rounded border border-wiki-raised bg-wiki-raised text-wiki-text hover:border-amber-500 hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {loading && (
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {!loading && hasPlayer ? '↻ Refresh' : 'Look up'}
        </button>
      </div>
      {hasPlayer && playerUpdatedAt && !notFound && !error && (
        <span className="text-xs text-gray-500">
          synced {new Date(playerUpdatedAt).toLocaleString()}
        </span>
      )}
      {notFound && (
        <span className="text-xs text-yellow-500">No data for that player yet</span>
      )}
      {error && (
        <span className="text-xs text-red-400">Lookup failed: {error}</span>
      )}
    </div>
  );
}
