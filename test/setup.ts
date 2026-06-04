import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '../src/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
    server.resetHandlers(); // undo any per-test server.use(...) overrides
    localStorage.clear();   // this app persists to localStorage on every change
});

afterAll(() => server.close());

