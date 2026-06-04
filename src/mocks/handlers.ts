import { http, HttpResponse } from 'msw';
import type { Task } from '../types';
import type { PlayerResponse } from '../lib/serverApi';

const BASE = 'http://localhost:8080'; // must match .env.test

// Small, predictable fixtures. Keep them minimal — override per-test when you need variety.
export const tasksFixture: Task[] = [
    { id: 1, name: 'Kill a goblin', description: 'Easy combat', tier: 'easy', region: 'General' },
    { id: 2, name: 'Mine adamant', description: 'Get the ore', tier: 'medium', region: 'Asgarnia' },
    { id: 3, name: 'Slay a dragon', description: 'Hard combat', tier: 'hard', region: 'Asgarnia' },
];

export const playerFixture: PlayerResponse = {
    username: 'Zezima',
    updatedAt: '2026-06-01T00:00:00.000Z',
    skillLevels: { attack: 60 },
    completedTaskIds: [1],
};

export const handlers = [
    http.get(`${BASE}/tasks`, () =>
        HttpResponse.json(tasksFixture, { headers: { ETag: '"v1"' } }),
    ),

    http.get(`${BASE}/player/:username`, ({ params }) => {
        if (params.username === 'nobody') {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json({ ...playerFixture, username: String(params.username) });
    }),
];

