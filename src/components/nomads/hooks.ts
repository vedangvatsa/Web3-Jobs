'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const emptyQuery = new URLSearchParams();

export function useNomadQuery() {
  const params = useSearchParams(), pathname = usePathname();
  // Static shells have no query. Match them during hydration, then apply the shared URL.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  function update(values: Record<string, string | null>) {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(values)) { if (value) next.set(key, value); else next.delete(key); }
    const query = next.toString();
    window.history.replaceState(null, '', `${pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }
  return { params: hydrated ? params : emptyQuery, update };
}

const downloads = new Map<string, Promise<unknown>>();
export function useNomadData<T>(url: string | null, valid: (value: unknown) => boolean) {
  const [state, setState] = useState<{ url: string | null; data: T | null; error: boolean }>({ url: null, data: null, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!url) return;
    let active = true;
    let download = downloads.get(url);
    if (!download) {
      download = fetch(url, { signal: AbortSignal.timeout(15000) }).then(async response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); const data: unknown = await response.json(); if (!valid(data)) throw new Error('Invalid catalog'); return data; }).catch(error => { downloads.delete(url); throw error; });
      downloads.set(url, download);
    }
    download.then(data => { if (active) setState({ url, data: data as T, error: false }); }).catch(() => { if (active) setState({ url, data: null, error: true }); });
    return () => { active = false; };
  }, [url, attempt, valid]);
  return { data: state.url === url ? state.data : null, error: state.url === url && state.error, loading: !!url && (state.url !== url || (!state.data && !state.error)), retry: () => { if (url) downloads.delete(url); setState({ url: null, data: null, error: false }); setAttempt(value => value + 1); } };
}
