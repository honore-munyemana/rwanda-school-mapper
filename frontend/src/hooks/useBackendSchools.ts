import { useState, useEffect, useCallback } from 'react';
import type { School } from '@/data/rwandaSchools';
import { parseSchoolsGeoJsonToSchools } from '@/lib/schoolGeoJson';

const API_BASE = 'http://localhost:5000';

export function useBackendSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/schools`);
      if (!res.ok) {
        throw new Error('Failed to load schools');
      }
      const geojson = await res.json();
      setSchools(parseSchoolsGeoJsonToSchools(geojson));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schools');
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { schools, loading, error, refresh };
}
