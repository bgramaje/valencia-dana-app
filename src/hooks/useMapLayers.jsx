/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
import { useEffect, useMemo, useState } from 'react';

import { DateTime } from 'luxon';

import { PICKUP_STATUS } from '@/lib/enums';
import { useMarkers } from '@/context/MarkerContext';
import { usePickups } from '@/context/PickupContext';
import { IconLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';

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

  const [pulseRadius, setPulseRadius] = useState(80);

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
      new IconLayer({
        id: 'markers-layer-verified-badge-background',
        data: markers.filter((item) => DateTime.fromISO(item.created_at) < DateTime.now().minus({ days: 2 })),
        pickable: true,
        getIcon: () => ({
          url: `https://api.iconify.design/tdesign/circle-filled.svg?width=40&height=40&color=${encodeURIComponent('#eb4034')}`,
          width: 40, // Use a larger base width
          height: 40, // Use a larger base heighttdesign:circle-filled
        }),
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 1.5, // Reduce size scale for less scaling
        getAngle: 0,
        getSize: 15, // Ensure this is in line with the actual icon size
        getPixelOffset: [18, 14], // Offset to ensure it aligns correctly
        visible: (activeLayers?.AFECTADO && zoom >= ZOOM_LIMIT),
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
      new IconLayer({
        id: 'markers-layer-verified-badge',
        data: markers.filter((item) => DateTime.fromISO(item.created_at) < DateTime.now().minus({ days: 2 })),
        pickable: true,
        getIcon: () => ({
          url: `https://api.iconify.design/lets-icons/alarm-fill.svg?width=40&height=40&color=${encodeURIComponent('#ffffff')}`,
          width: 40, // Use a larger base width
          height: 40, // Use a larger base height
        }),
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 1.5, // Reduce size scale for less scaling
        getAngle: 0,
        getSize: 10, // Ensure this is in line with the actual icon size
        getPixelOffset: [18, 14], // Offset to ensure it aligns correctly
        visible: (activeLayers?.AFECTADO && zoom >= ZOOM_LIMIT),
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
        opacity: 0.8,
        filled: true,
        radiusScale: 4,
        radiusMinPixels: zoom >= ZOOM_LIMIT ? 20 : 5, // Cambia el tamaño mínimo del marcador según el zoom
        radiusMaxPixels: 20,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 5,
        getFillColor: (d) => PICKUP_STATUS[d.status].rgbColor,
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
        id: 'pickups-layer',
        data: pickups,
        pickable: true,
        getIcon: (d) => {
          const color = d.status === 'DESCONOCIDO' ? 'white' : '#202020';
          return {
            url: `https://api.iconify.design/ph/package.svg?width=40&height=40&color=${encodeURIComponent(color)}`,
            width: 40, // Use a larger base width
            height: 40, // Use a larger base height
          };
        },
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 1.5, // Reduce size scale for less scaling
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
      new IconLayer({
        id: 'pickups-layer-verified-badge',
        data: pickups.filter((pickup) => pickup.verified),
        pickable: true,
        getIcon: () => ({
          url: `https://api.iconify.design/material-symbols/verified-rounded.svg?width=40&height=40&color=${encodeURIComponent('#2160ff')}`,
          width: 40, // Use a larger base width
          height: 40, // Use a larger base height
        }),
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 1.5, // Reduce size scale for less scaling
        getAngle: 0,
        getSize: 13, // Ensure this is in line with the actual icon size
        getPixelOffset: [18, 14], // Offset to ensure it aligns correctly
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
      && [
        new ScatterplotLayer({
          id: 'user-location-layer-border',
          data: [userLocation],
          getPosition: (d) => [d.longitude, d.latitude],
          getFillColor: [255, 255, 255],
          getRadius: pulseRadius + 24,
          pickable: false,
          updateTriggers: {
            getRadius: [pulseRadius],
          },
        }),
        new ScatterplotLayer({
          id: 'user-location-layer-fill',
          data: [userLocation],
          getPosition: (d) => [d.longitude, d.latitude],
          getFillColor: [33, 96, 255],
          getRadius: pulseRadius,
          pickable: false,
          updateTriggers: {
            getRadius: [pulseRadius],
          },
        }),

      ],
    [userLocation, pulseRadius],
  );

  return {
    layers: [...staticLayers, pulsingLayer, ...centroidLayers, ...pickupsLayer].filter(Boolean),
  };
};
