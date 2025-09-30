import React, { ReactNode, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { middleOfUSA } from '../lib/constants';

interface MapContainerProps {
  children?: ReactNode;
}

export default function MapContainer({ children }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<InstanceType<typeof maplibregl> | null>(null)

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty.json',
        center: middleOfUSA,
        zoom: 2,
      });
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="absolute top-0 bottom-0 left-0 right-0" />
      {children}
    </div>
  );
}