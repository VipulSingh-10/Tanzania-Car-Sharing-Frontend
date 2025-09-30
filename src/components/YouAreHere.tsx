import { useEffect, useState } from 'react';
import { Popup, useMap } from '@vis.gl/react-maplibre';
import getLocation, { Loc } from '../lib/gettinglocation';
import { middleOfUSA } from '../lib/constants';

export default function YouAreHere() {
  const [popupLocation, setPopupLocation] = useState<Loc | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const loc = await getLocation({ enableHighAccuracy: true, timeout: 5000 });
        if (cancelled) return;
        if (loc && Array.isArray(loc)) {
          setPopupLocation(loc);
          setAccuracy(null);
          map.flyTo({ center: loc, zoom: 20 });
        } else {
          setPopupLocation(middleOfUSA as Loc);
          map.flyTo({ center: middleOfUSA as Loc, zoom: 8 });
        }
      } catch {
        if (cancelled) return;
        setError('Could not determine location');
        setPopupLocation(middleOfUSA as Loc);
        map.flyTo({ center: middleOfUSA as Loc, zoom: 8 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [map]);

  if (!map || !popupLocation) return null;
  const [lng, lat] = popupLocation;

  return (
    <Popup
      longitude={lng}
      latitude={lat}
      closeButton
      onClose={() => setPopupLocation(null)}
    >
      <div style={{ minWidth: 160 }}>
        <h3>You are approximately here!</h3>
        {loading && <p>Locating…</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p>Lng: {lng.toFixed(5)}, Lat: {lat.toFixed(5)}</p>
        {accuracy != null && <p>Accuracy: {accuracy} m</p>}
        <button onClick={() => map.flyTo({ center: popupLocation, zoom: 12 })}>
          Center
        </button>
      </div>
    </Popup>
  );
}