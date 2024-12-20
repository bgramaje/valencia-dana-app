/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
import { useMarkers } from '@/context/MarkerContext';
import { usePickups } from '@/context/PickupContext';
import { PICKUP_STATUS } from '@/lib/enums';
import { ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import { useState, useEffect, useMemo } from 'react';

const ZOOM_LIMIT = 11;

export const useMapLayers = ({
  markers,
  pickups,
  towns,
  userLocation,
  setSelectedMarker,
  setSelectedPickup,
  viewState,
  activeLayers = {
    AFECTADO: true,
    PUNTO: true,
  },
}) => {
  const { setShowInfoPickupDialog } = usePickups();
  const { setShowMarkerDialog } = useMarkers();
  const { zoom } = viewState;

  const [pulseRadius, setPulseRadius] = useState(100);

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
          : d.type.color),
        onClick: ({ object }) => {
          if (object) {
            setSelectedMarker(object);
            setShowMarkerDialog(true);
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
          url: `${d.type.iconMap}?width=100&height=100`,
          width: 100,
          height: 100,
        }),
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 1,
        parameters: { depthTest: false },
        getAngle: 0,
        getSize: 20,
        visible: (activeLayers?.AFECTADO && zoom >= ZOOM_LIMIT), // Mostrar los marcadores individuales cuando el zoom es mayor o igual a 10
        onClick: ({ object }) => {
          if (object) {
            setSelectedMarker(object);
            setShowMarkerDialog(true);
          }
        },
        updateTriggers: {
          getColor: [markers],
          visible: [zoom],
        },
      }),
    ],
    [markers, setSelectedMarker, setShowMarkerDialog, zoom, activeLayers],
  );

  const centroidLayers = useMemo(
    () => [
      new ScatterplotLayer({
        id: 'scatter-plot-centroid-border',
        data: towns,
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
        data: towns,
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
        data: towns,
        pickable: false,
        fontFamily: 'Inter',
        fontWeight: 600,
        getPosition: (d) => [d.longitude, d.latitude],
        getText: (d) => `${d.total_helpers_markers}`, // Display the count value
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
    [towns, zoom, activeLayers],
  );

  const pickupsLayer = useMemo(
    () => [
      new ScatterplotLayer({
        id: 'scatter-plot-pickups-border',
        data: pickups,
        pickable: true,
        opacity: 1,
        filled: true,
        radiusScale: 2,
        radiusMinPixels: 10, // Slightly larger than inner layer to create a border effect
        radiusMaxPixels: 22,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 3, // Slightly larger than the inner fill layer
        getFillColor: [255, 255, 255, 255], // Border color (e.g., black)
        visible: (activeLayers?.PUNTO && zoom >= ZOOM_LIMIT),
        onClick: ({ object }) => {
          if (object) {
            setSelectedPickup(object);
            setShowInfoPickupDialog(true);
          }
        },
        updateTriggers: {
          visible: [zoom, activeLayers],
        },
      }),
      new IconLayer({
        id: 'pickups-layer',
        data: pickups,
        pickable: true,
        getIcon: (d) => {
          const color = PICKUP_STATUS[d.status].color ?? '#202020';
          return {
            url: `https://api.iconify.design/mynaui/location-home-solid.svg?width=100&height=100&color=${encodeURIComponent(color)}`,
            width: 100, // Use a larger base width
            height: 100, // Use a larger base height
          };
        },
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 2.25, // Reduce size scale for less scaling
        getAngle: 0,
        getSize: 20, // Ensure this is in line with the actual icon size
        getPixelOffset: [0, 0], // Offset to ensure it aligns correctly
        visible: (activeLayers?.PUNTO && zoom >= ZOOM_LIMIT),
        onClick: ({ object }) => {
          if (object) {
            setSelectedPickup(object);
            setShowInfoPickupDialog(true);
          }
        },
        updateTriggers: {
          getColor: [pickups],
          visible: [zoom],
        },
      }),
    ],
    [pickups, zoom, activeLayers, setSelectedPickup, setShowInfoPickupDialog],
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
    layers: [...staticLayers, pulsingLayer, ...centroidLayers, ...pickupsLayer].filter(Boolean),
  };
};
