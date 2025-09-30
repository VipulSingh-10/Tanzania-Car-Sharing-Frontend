import { useEffect, useRef, useState } from 'react';
import { useMap } from "@vis.gl/react-maplibre";

type NomResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function SearchBar() {
  const { current: map } = useMap();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<NomResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
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
        url.searchParams.set('addressdetails', '0');
        const res = await fetch(url.toString(), {
          signal: ctrl.signal,
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error(`${res.status}`);
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

  function flyToResult(r: NomResult) {
    if (!map) return;
    const lon = Number(r.lon);
    const lat = Number(r.lat);
    if (Number.isFinite(lon) && Number.isFinite(lat)) {
      map.flyTo({ center: [lon, lat], zoom: 12 });
    }
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (results.length > 0) flyToResult(results[0]);
      else setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  if (!map) return null;
  return (
    <div ref={boxRef} style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, width: 320, maxWidth: '70vw' }}>
      <input
        type="search"
        placeholder="Search places…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q.trim().length >= 2 && setOpen(true)}
        onKeyDown={onKeyDown}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', background: 'white' }}
      />
      {open && (loading || results.length > 0) && (
        <div style={{ marginTop: 4, background: 'white', border: '1px solid #ddd', borderRadius: 6, maxHeight: 280, overflowY: 'auto' }}>
          {loading && <div style={{ padding: '8px 10px', color: '#666' }}>Searching…</div>}
          {!loading && results.map((r, idx) => (
            <button
              key={idx}
              role="option"
              onClick={() => flyToResult(r)}
              style={{ width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {r.display_name}
            </button>
          ))}
          {!loading && results.length === 0 && <div style={{ padding: '8px 10px', color: '#666' }}>No results</div>}
        </div>
      )}
    </div>
  );
}