import { useEffect, useRef, useState } from 'react';
import { Points } from '@/types/api';

interface LocationSearchProps {
  value: string;
  onChange: (address: string, lat?: number, lon?: number) => void;
  placeholder?: string;
  required?: boolean;
}

type NomResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function LocationSearch({ value, onChange, placeholder, required }: LocationSearchProps) {
  const [q, setQ] = useState(value);
  const [results, setResults] = useState<NomResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const query = q.trim();
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('limit', '7');
        const res = await fetch(url.toString(), { signal: ctrl.signal, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.statusText);
        const data = (await res.json()) as NomResult[];
        setResults(data);
        setOpen(true);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const selectResult = (r: NomResult) => {
    const lon = Number(r.lon);
    const lat = Number(r.lat);
    onChange(r.display_name, lat, lon);
    setQ(r.display_name);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => q.trim().length >= 2 && setOpen(true)}
        placeholder={placeholder}
        required={required}
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }}
      />
      {open && (loading || results.length > 0) && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', maxHeight: 200, overflowY: 'auto', zIndex: 10 }}>
          {loading && <div style={{ padding: 8 }}>Searching…</div>}
          {results.map((r, idx) => (
            <button
              key={idx}
              onClick={() => selectResult(r)}
              style={{ display: 'block', width: '100%', padding: 8, textAlign: 'left', border: 'none', background: 'white' }}
            >
              {r.display_name}
            </button>
          ))}
          {!loading && results.length === 0 && <div style={{ padding: 8 }}>No results</div>}
        </div>
      )}
    </div>
  );
}