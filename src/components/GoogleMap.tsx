
import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    info?: string;
  }>;
  className?: string;
}

export default function GoogleMap({ 
  center = { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
  zoom = 10,
  markers = [],
  className = "w-full h-64"
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initializeMap = async () => {
      // Check if Google Maps is already loaded
      if (!window.google || !window.google.maps) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          createMap();
        };
        
        document.head.appendChild(script);
      } else {
        createMap();
      }
    };

    const createMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      markers.forEach(markerData => {
        const marker = new google.maps.Marker({
          position: markerData.position,
          map: mapInstanceRef.current,
          title: markerData.title,
        });

        if (markerData.info) {
          const infoWindow = new google.maps.InfoWindow({
            content: markerData.info,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
        }

        markersRef.current.push(marker);
      });

      // Adjust map bounds if there are markers
      if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.position));
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [markers]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  return <div ref={mapRef} className={className} />;
}
