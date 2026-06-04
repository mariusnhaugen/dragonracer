import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { loadCatalog } from '../lib/serverApi';

export function useCatalog(): {
  tasks: Task[];
  loading: boolean;
  error: string | null;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog()
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, []);

  return { tasks, loading, error };
}
