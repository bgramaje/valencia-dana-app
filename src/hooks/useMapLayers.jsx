import { ASSISTANCE_TYPES } from '@/lib/enums';
import { ScatterplotLayer, IconLayer } from '@deck.gl/layers';
import { useState, useEffect, useMemo } from 'react';

import { toast } from 'sonner';

export const useMapLayers = (userLocation, setSelectedMarker, setModalOpen) => {
  const [markers, setMarkers] = useState([]);
  const [pulseRadius, setPulseRadius] = useState(100);

  // Función para obtener los markers
  const fetchMarkers = () => {
    fetch('/api/markers')
      .then((response) => response.json())
      .then((data) => setMarkers(data))
      .catch((error) => toast.error(`Error loading markers: ${error}`));
  };

  // Llama a fetchMarkers cuando el componente se monta
  useEffect(() => {
    fetchMarkers();
  }, []);

  // Configura el efecto de pulso en userLocation
  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() * 0.005;
      const newRadius = 100 + 20 * Math.sin(time);
      setPulseRadius(newRadius);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Memoriza las capas estáticas
  const staticLayers = useMemo(
    () => [
      new ScatterplotLayer({
        id: 'scatter-plot',
        data: markers,
        pickable: true,
        opacity: 0.5,
        filled: true,
        radiusScale: 4,
        radiusMinPixels: 20,
        radiusMaxPixels: 20,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 5,
        getFillColor: (d) => ASSISTANCE_TYPES[d.type].color,
        onClick: ({ object }) => {
          if (object) {
            setSelectedMarker(object);
            setModalOpen(true);
          }
        },
      }),
      new IconLayer({
        id: 'icon-layer',
        data: markers,
        pickable: true,
        getIcon: (d) => ({
          url: ASSISTANCE_TYPES[d.type].iconMap,
          width: 20,
          height: 20,
        }),
        getPosition: (d) => [d.longitude, d.latitude],
        getColor: (d) => ASSISTANCE_TYPES[d.type].color,
        sizeScale: 1,
        parameters: { depthTest: false },
        getAngle: 0,
        getSize: 20,
        onClick: ({ object }) => {
          if (object) {
            setSelectedMarker(object);
            setModalOpen(true);
          }
        },
      }),
    ],
    [markers, setSelectedMarker, setModalOpen], // Solo se actualiza cuando markers cambia
  );

  // Capa con efecto de pulso para userLocation
  const pulsingLayer = useMemo(
    () => userLocation
      && new ScatterplotLayer({
        id: 'user-location-layer',
        data: [userLocation],
        getPosition: (d) => [d.longitude, d.latitude],
        getFillColor: [255, 0, 0],
        getRadius: pulseRadius,
        pickable: false,
      }),
    [userLocation, pulseRadius],
  );

  return {
    markers,
    setMarkers,
    fetchMarkers,
    layers: [...staticLayers, pulsingLayer].filter(Boolean),
  };
};
