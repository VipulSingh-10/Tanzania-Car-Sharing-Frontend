import React, { useState } from 'react';
import maplibregl from 'maplibre-gl';
import ReactMapGL, { Marker } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { middleOfUSA } from '@/lib/constants';

export interface MarkerLoc {
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  markers: MarkerLoc[];
  height?: string;
}

export default function MapView({ markers, height = '400px' }: MapViewProps) {
  const [viewState, setViewState] = useState({
    longitude: middleOfUSA[0],
    latitude: middleOfUSA[1],
    zoom: 2,
  });

  return (
    <div style={{ width: '100%', height }}>
      <ReactMapGL
        {...viewState}
        width="100%"
        height="100%"
        mapLib={maplibregl}
        mapStyle="https://tiles.openfreemap.org/styles/liberty.json"
        onMove={(evt) => setViewState(evt.viewState)}
      >
        {markers.map((m, i) => (
          <Marker key={i} longitude={m.longitude} latitude={m.latitude} anchor="bottom">
            <div className="bg-blue-600 w-3 h-3 rounded-full" />
          </Marker>
        ))}
      </ReactMapGL>
    </div>
  );
}