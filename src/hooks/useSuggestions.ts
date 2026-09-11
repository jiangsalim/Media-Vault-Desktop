/** Debounced YouTube search-suggestions hook. */
import { useEffect, useRef, useState } from 'react';

export interface UseSuggestionsResult {
  suggestions: string[];
  loading: boolean;
}

const DEBOUNCE_MS = 300;

export function useSuggestions(query: string, enabled = true): UseSuggestionsResult {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const reqId = ++reqIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const list = await window.mediavault.getSuggestions(trimmed, 8);
        // Ignore stale responses (a newer keystroke arrived first)
        if (reqId === reqIdRef.current) {
          setSuggestions(list);
        }
      } catch {
        if (reqId === reqIdRef.current) setSuggestions([]);
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, enabled]);

  return { suggestions, loading };
}