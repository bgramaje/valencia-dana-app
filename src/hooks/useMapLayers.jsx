/* eslint-disable no-param-reassign */
import { ASSISTANCE_TYPES } from '@/lib/enums';
import { ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import { useState, useEffect, useMemo } from 'react';
import * as turf from '@turf/turf';

import { toast } from 'sonner';
import { isEmpty } from 'lodash';

const ZOOM_LIMIT = 12;
export const useMapLayers = (
  userLocation,
  setSelectedMarker,
  setModalOpen,
  viewState,
  activeLayers = {
    AFECTADO: true,
    VOLUNTARIO: true,
    PUNTO: true,
  },
) => {
  const { zoom } = viewState;
  const [markers, setMarkers] = useState([]);
  const [pulseRadius, setPulseRadius] = useState(100);

  // Agrupar marcadores por ciudad y calcular el centro de cada grupo
  const cityCenters = useMemo(() => {
    if (isEmpty(markers)) return [];
    const groupedByCity = markers.reduce((acc, marker) => {
      const { city } = marker;
      if (!acc[city]) acc[city] = [];
      acc[city].push(marker);
      return acc;
    }, {});

    return Object.keys(groupedByCity).map((city) => {
      const cityMarkers = groupedByCity[city];
      const points = cityMarkers.map((marker) => turf.point([marker.longitude, marker.latitude]));
      const featureCollection = turf.featureCollection(points);
      const center = turf.center(featureCollection);

      return {
        city,
        type: cityMarkers[0].type,
        longitude: center.geometry.coordinates[0],
        latitude: center.geometry.coordinates[1],
        count: cityMarkers.length,
      };
    });
  }, [markers]);

  // Función para obtener los markers
  const fetchMarkers = () => {
    fetch('/api/markers')
      .then((response) => response.json())
      .then((data) => setMarkers(data))
      .catch((error) => toast.error(`Error loading markers: ${error}`));
  };

  useEffect(() => fetchMarkers(), []);

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
        opacity: 0.8,
        filled: true,
        radiusScale: 4,
        radiusMinPixels: zoom >= ZOOM_LIMIT ? 20 : 5, // Cambia el tamaño mínimo del marcador según el zoom
        radiusMaxPixels: 20,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 5,
        getFillColor: (d) => (d.status === 'completado'
          ? [140, 140, 140, 200]
          : ASSISTANCE_TYPES[d.type].color),
        onClick: ({ object }) => {
          if (object) {
            setSelectedMarker(object);
            setModalOpen(true);
          }
        },
        visible: (activeLayers?.AFECTADO && zoom >= ZOOM_LIMIT), // Mostrar los marcadores individuales cuando el zoom es mayor o igual a 10
        updateTriggers: {
          getColor: [markers],
          visible: [zoom, activeLayers],
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
        getColor: (d) => (d.status === 'completado'
          ? [140, 140, 140, 60]
          : ASSISTANCE_TYPES[d.type].color),
        sizeScale: 1,
        parameters: { depthTest: false },
        getAngle: 0,
        getSize: 20,
        visible: (activeLayers?.AFECTADO && zoom >= ZOOM_LIMIT), // Mostrar los marcadores individuales cuando el zoom es mayor o igual a 10
        onClick: ({ object }) => {
          if (object) {
            setSelectedMarker(object);
            setModalOpen(true);
          }
        },
        updateTriggers: {
          getColor: [markers],
          visible: [zoom],
        },
      }),
    ],
    [markers, setSelectedMarker, setModalOpen, zoom, activeLayers],
  );

  const centroidLayers = useMemo(
    () => [
      new ScatterplotLayer({
        id: 'scatter-plot-centroid-border',
        data: cityCenters,
        pickable: true,
        opacity: 1,
        filled: true,
        radiusScale: 4,
        radiusMinPixels: 22, // Slightly larger than inner layer to create a border effect
        radiusMaxPixels: 22,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 6, // Slightly larger than the inner fill layer
        getFillColor: [143, 88, 37], // Border color (e.g., black)
        visible: (activeLayers?.AFECTADO && zoom < ZOOM_LIMIT),
        updateTriggers: {
          visible: [zoom, activeLayers],
        },
      }),
      new ScatterplotLayer({
        id: 'scatter-plot-centroid',
        data: cityCenters,
        pickable: true,
        opacity: 1,
        filled: true,
        radiusScale: 4,
        radiusMinPixels: 20, // Cambia el tamaño mínimo del marcador según el zoom
        radiusMaxPixels: 20,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 5,
        getFillColor: [255, 168, 87],
        visible: (activeLayers?.AFECTADO && zoom < ZOOM_LIMIT),
        updateTriggers: {
          visible: [zoom, activeLayers],
        },
      }),
      new TextLayer({
        id: 'text-layer-centroid-count',
        data: cityCenters,
        pickable: false,
        fontFamily: 'Inter',
        fontWeight: 600,
        getPosition: (d) => [d.longitude, d.latitude],
        getText: (d) => `${d.count}`, // Display the count value
        getSize: 16,
        getColor: [0, 0, 0, 255], // Color of the text
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        visible: (activeLayers?.AFECTADO && zoom < ZOOM_LIMIT),
        updateTriggers: {
          visible: [zoom, activeLayers],
        },
      }),

    ],
    [cityCenters, zoom, activeLayers],
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
    layers: [...staticLayers, pulsingLayer, centroidLayers].filter(Boolean),
  };
};
