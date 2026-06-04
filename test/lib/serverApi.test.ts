import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadCatalog, fetchPlayer } from '../../src/lib/serverApi';

const BASE = 'http://localhost:8080';

function mockResponse(opts: {
  status?: number;
  body?: unknown;
  etag?: string;
}): Response {
  const headers = new Headers();
  if (opts.etag) headers.set('ETag', opts.etag);
  return new Response(opts.body === undefined ? null : JSON.stringify(opts.body), {
    status: opts.status ?? 200,
    headers,
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv('VITE_API_BASE', BASE);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('loadCatalog', () => {
  it('first call with no cache: returns body and stores ETag + body', async () => {
    const tasks = [
      { id: 0, name: 'A', description: '', tier: 'easy', region: 'General' },
    ];
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse({ status: 200, body: tasks, etag: '"abc123"' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await loadCatalog();

    expect(result).toEqual(tasks);
    expect(localStorage.getItem('server.tasks.etag')).toBe('"abc123"');
    expect(localStorage.getItem('server.tasks.catalog')).toBe(JSON.stringify(tasks));

    const init = fetchMock.mock.calls[0][1] as RequestInit | undefined;
    const headers = (init?.headers ?? {}) as Record<string, string>;
    expect(headers['If-None-Match']).toBeUndefined();
  });

  it('subsequent call with cache: sends If-None-Match and returns cached body on 304', async () => {
    const cached = [
      { id: 0, name: 'A', description: '', tier: 'easy', region: 'General' },
    ];
    localStorage.setItem('server.tasks.catalog', JSON.stringify(cached));
    localStorage.setItem('server.tasks.etag', '"abc123"');

    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ status: 304 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await loadCatalog();

    expect(result).toEqual(cached);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['If-None-Match']).toBe('"abc123"');
  });
});

describe('fetchPlayer', () => {
  it('200: returns parsed body', async () => {
    const player = {
      username: 'Zezima',
      updatedAt: '2026-05-21T14:32:58.481Z',
      skillLevels: { attack: 60, strength: 70 },
      completedTaskIds: [3, 8, 51, 1247],
    };
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ status: 200, body: player }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchPlayer('Zezima');

    expect(result).toEqual(player);
  });

  it('404: returns null without throwing', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchPlayer('Nobody')).resolves.toBeNull();
  });

  it('encodes usernames containing spaces', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchPlayer('Some Name');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${BASE}/player/Some%20Name`);
  });
});
