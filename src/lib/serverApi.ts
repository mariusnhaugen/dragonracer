import type { Task } from '../types';

export interface PlayerResponse {
  username: string;
  updatedAt: string;
  skillLevels: Record<string, number>;
  completedTaskIds: number[];
}

const CATALOG_KEY = 'server.tasks.catalog';
const ETAG_KEY = 'server.tasks.etag';

function getBase(): string {
  const base = import.meta.env.VITE_API_BASE;
  if (!base) {
    throw new Error(
      'VITE_API_BASE is not set. Copy .env.local.example to .env.local and restart Vite.',
    );
  }
  return base;
}

export async function loadCatalog(): Promise<Task[]> {
  const base = getBase();
  const cachedEtag = localStorage.getItem(ETAG_KEY);
  const cachedJson = localStorage.getItem(CATALOG_KEY);

  const res = await fetch(`${base}/tasks`, {
    headers: cachedEtag && cachedJson ? { 'If-None-Match': cachedEtag } : {},
  });

  if (res.status === 304 && cachedJson) {
    return JSON.parse(cachedJson) as Task[];
  }
  if (!res.ok) {
    throw new Error(`/tasks failed: ${res.status}`);
  }

  const fresh = (await res.json()) as Task[];
  const newEtag = res.headers.get('ETag');
  if (newEtag) localStorage.setItem(ETAG_KEY, newEtag);
  localStorage.setItem(CATALOG_KEY, JSON.stringify(fresh));
  return fresh;
}

export async function fetchPlayer(username: string): Promise<PlayerResponse | null> {
  const base = getBase();
  const res = await fetch(`${base}/player/${encodeURIComponent(username)}`);

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`/player/${username} failed: ${res.status}`);
  }

  return (await res.json()) as PlayerResponse;
}
