'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  sourceCoords: [number, number] | null;
  destCoords: [number, number] | null;
  routeCoords: [number, number][] | null;
  onMarkerDrag?: (type: 'source' | 'destination', coords: [number, number]) => void;
}

export default function MapComponent({
  sourceCoords,
  destCoords,
  routeCoords,
  onMarkerDrag
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const sourceMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Custom icons using inline SVGs to avoid Webpack missing image errors
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 4px ${color}80);">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="rgba(3, 7, 18, 0.7)"></path>
          <circle cx="12" cy="10" r="3.5" fill="${color}"></circle>
        </svg>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet Map
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([23.3441, 85.3096], 8); // Center on Jharkhand

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(leafletMap.current);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    // Update Source Marker
    if (sourceCoords) {
      if (sourceMarkerRef.current) {
        sourceMarkerRef.current.setLatLng(sourceCoords);
      } else {
        sourceMarkerRef.current = L.marker(sourceCoords, {
          icon: createCustomIcon('#06b6d4'), // Cyan color
          draggable: !!onMarkerDrag
        }).addTo(map);

        if (onMarkerDrag) {
          sourceMarkerRef.current.on('dragend', (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onMarkerDrag('source', [position.lat, position.lng]);
          });
        }
      }
    } else {
      if (sourceMarkerRef.current) {
        sourceMarkerRef.current.remove();
        sourceMarkerRef.current = null;
      }
    }

    // Update Destination Marker
    if (destCoords) {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng(destCoords);
      } else {
        destMarkerRef.current = L.marker(destCoords, {
          icon: createCustomIcon('#8b5cf6'), // Purple color
          draggable: !!onMarkerDrag
        }).addTo(map);

        if (onMarkerDrag) {
          destMarkerRef.current.on('dragend', (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onMarkerDrag('destination', [position.lat, position.lng]);
          });
        }
      }
    } else {
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
    }

    // Update Polyline Route
    if (routeCoords && routeCoords.length > 0) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(routeCoords);
      } else {
        polylineRef.current = L.polyline(routeCoords, {
          color: '#06b6d4',
          weight: 4,
          opacity: 0.8,
          dashArray: '5, 10'
        }).addTo(map);
      }
    } else {
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    }

    // Auto fit bounds
    const bounds: L.LatLngExpression[] = [];
    if (sourceCoords) bounds.push(sourceCoords);
    if (destCoords) bounds.push(destCoords);

    if (bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      } else {
        map.fitBounds(L.latLngBounds(bounds), {
          padding: [50, 50],
          maxZoom: 15
        });
      }
    }
  }, [sourceCoords, destCoords, routeCoords, onMarkerDrag]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height: '100%', minHeight: '350px', borderRadius: '12px', zIndex: 1 }}
    />
  );
}
