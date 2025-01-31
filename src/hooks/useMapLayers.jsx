import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { MARKER_STATUS, PICKUP_STATUS } from '@/lib/enums';
import { useMarkers } from '@/context/MarkerContext';
import { usePickups } from '@/context/PickupContext';
import { IconLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';

const ZOOM_LIMIT = 11;

const usePulsatingEffect = () => {
  const [pulseRadius, setPulseRadius] = useState(80);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() * 0.005;
      const newRadius = 100 + 20 * Math.sin(time);
      setPulseRadius(newRadius);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return pulseRadius;
};

const createMarkerLayers = ({
  markers,
  zoom,
  activeLayers,
  setSelectedMarker,
  setShowMarkerDialog,
}) => {
  const isMarkerLayerVisible = (status) => activeLayers?.[`marker-${status.toLowerCase()}`] && zoom >= ZOOM_LIMIT;

  // Get all marker statuses from MARKER_STATUS
  const markerStatuses = Object.values(MARKER_STATUS);

  // Create layers for each marker status
  const layers = markerStatuses.flatMap((status) => {
    if (!isMarkerLayerVisible(status)) return []; // Skip creating layers for inactive statuses

    const filteredMarkers = markers.filter((marker) => marker.status === status);

    const overdueMarkers = filteredMarkers.filter(
      (item) => DateTime.fromISO(item.created_at) < DateTime.now().minus({ days: 2 }),
    );

    return [
      new ScatterplotLayer({
        id: `scatter-plot-${status}`,
        data: filteredMarkers,
        pickable: true,
        opacity: 0.8,
        filled: true,
        radiusScale: 4,
        radiusMinPixels: zoom >= ZOOM_LIMIT ? 20 : 5,
        radiusMaxPixels: 20,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 5,
        getFillColor: (d) => (d.status === 'completado' ? [140, 140, 140, 200] : d.type.color),
        onClick: ({ object }) => {
          if (!object) return;
          setSelectedMarker(object);
          setShowMarkerDialog(true);
        },
        visible: true, // Layer is visible because we filtered by active status
        updateTriggers: {
          getColor: [filteredMarkers],
          visible: [zoom, activeLayers],
        },
      }),
      new IconLayer({
        id: `icon-layer-${status}`,
        data: filteredMarkers,
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
        visible: true, // Layer is visible because we filtered by active status
        onClick: ({ object }) => {
          if (!object) return;
          setSelectedMarker(object);
          setShowMarkerDialog(true);
        },
        updateTriggers: {
          getColor: [filteredMarkers],
          visible: [zoom, activeLayers],
        },
      }),
      new IconLayer({
        id: `markers-layer-verified-badge-background-${status}`,
        data: overdueMarkers,
        pickable: true,
        getIcon: () => ({
          url: `https://api.iconify.design/tdesign/circle-filled.svg?width=40&height=40&color=${encodeURIComponent('#eb4034')}`,
          width: 40,
          height: 40,
        }),
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 1.5,
        getAngle: 0,
        getSize: 15,
        getPixelOffset: [18, 14],
        visible: true, // Layer is visible because we filtered by active status
        updateTriggers: {
          getColor: [overdueMarkers],
          visible: [zoom],
        },
      }),
      new IconLayer({
        id: `markers-layer-verified-badge-badge-${status}`,
        data: overdueMarkers,
        pickable: true,
        getIcon: () => ({
          url: `https://api.iconify.design/lets-icons/alarm-fill.svg?width=40&height=40&color=${encodeURIComponent('#ffffff')}`,
          width: 40,
          height: 40,
        }),
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 1.5,
        getAngle: 0,
        getSize: 10,
        getPixelOffset: [18, 14],
        visible: true, // Layer is visible because we filtered by active status
        updateTriggers: {
          getColor: [overdueMarkers],
          visible: [zoom],
        },
      }),
    ];
  });

  return layers;
};

const createCentroidLayers = ({ towns, zoom, activeLayers }) => {
  const isCentroidLayerVisible = activeLayers?.AFECTADO && zoom < ZOOM_LIMIT;

  return [
    new ScatterplotLayer({
      id: 'scatter-plot-centroid-border',
      data: towns,
      pickable: true,
      opacity: 1,
      filled: true,
      radiusScale: 4,
      radiusMinPixels: 22,
      radiusMaxPixels: 22,
      getPosition: (d) => [d.longitude, d.latitude],
      getRadius: 6,
      getFillColor: [143, 88, 37],
      visible: isCentroidLayerVisible,
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
      radiusMinPixels: 20,
      radiusMaxPixels: 20,
      getPosition: (d) => [d.longitude, d.latitude],
      getRadius: 5,
      getFillColor: [255, 168, 87],
      visible: isCentroidLayerVisible,
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
      getText: (d) => `${d.total_helpers_markers}`,
      getSize: 16,
      getColor: [0, 0, 0, 255],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      visible: isCentroidLayerVisible,
      updateTriggers: {
        visible: [zoom, activeLayers],
      },
    }),
  ];
};

const createPickupLayers = ({
  pickups,
  zoom,
  activeLayers,
  setSelectedPickup,
  setShowInfoPickupDialog,
}) => {
  const isPickupLayerVisible = (status) => activeLayers?.[`pickup-${status}`] && zoom >= ZOOM_LIMIT;

  const pickupStatuses = Object.keys(PICKUP_STATUS);

  const layers = pickupStatuses.flatMap((status) => {
    if (!isPickupLayerVisible(status)) {
      return []; // Skip creating layers for inactive statuses
    }

    // Filter pickups for the current status
    const filteredPickups = pickups.filter((pickup) => pickup.status === status);

    return [
      new ScatterplotLayer({
        id: `scatter-plot-pickups-border-${status}`,
        data: filteredPickups,
        pickable: true,
        opacity: 0.8,
        filled: true,
        radiusScale: 4,
        radiusMinPixels: zoom >= ZOOM_LIMIT ? 20 : 5,
        radiusMaxPixels: 20,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 5,
        getFillColor: PICKUP_STATUS[status].rgbColor,
        onClick: ({ object }) => {
          if (object) {
            setSelectedPickup(object);
            setShowInfoPickupDialog(true);
          }
        },
        visible: true, // Layer is visible because we filtered by active status
        updateTriggers: {
          getColor: [filteredPickups],
          visible: [zoom, activeLayers],
        },
      }),
      new IconLayer({
        id: `pickups-layer-${status}`,
        data: filteredPickups,
        pickable: true,
        getIcon: () => {
          const color = status === 'DESCONOCIDO' ? 'white' : '#202020';
          return {
            url: `https://api.iconify.design/ph/package.svg?width=40&height=40&color=${encodeURIComponent(color)}`,
            width: 40,
            height: 40,
          };
        },
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 1.5,
        getAngle: 0,
        getSize: 20,
        getPixelOffset: [0, 0],
        visible: true, // Layer is visible because we filtered by active status
        onClick: ({ object }) => {
          if (object) {
            setSelectedPickup(object);
            setShowInfoPickupDialog(true);
          }
        },
        updateTriggers: {
          getColor: [filteredPickups],
          visible: [zoom],
        },
      }),
      new IconLayer({
        id: `pickups-layer-verified-badge-${status}`,
        data: filteredPickups.filter((pickup) => pickup.verified),
        pickable: true,
        getIcon: () => ({
          url: `https://api.iconify.design/material-symbols/verified-rounded.svg?width=40&height=40&color=${encodeURIComponent('#2160ff')}`,
          width: 40,
          height: 40,
        }),
        getPosition: (d) => [d.longitude, d.latitude],
        sizeScale: 1.5,
        getAngle: 0,
        getSize: 13,
        getPixelOffset: [18, 14],
        visible: true, // Layer is visible because we filtered by active status
        onClick: ({ object }) => {
          if (object) {
            setSelectedPickup(object);
            setShowInfoPickupDialog(true);
          }
        },
        updateTriggers: {
          getColor: [filteredPickups],
          visible: [zoom],
        },
      }),
    ];
  });

  return layers;
};

export const useMapLayers = ({
  markers,
  pickups,
  towns,
  userLocation,
  setSelectedMarker,
  setSelectedPickup,
  viewState,
  activeLayers = { AFECTADO: true, PUNTO: true },
}) => {
  const { setShowInfoPickupDialog } = usePickups();
  const { setShowMarkerDialog } = useMarkers();
  const { zoom } = viewState;

  const pulseRadius = usePulsatingEffect();

  const staticLayers = useMemo(
    () => [
      ...createMarkerLayers({
        markers,
        zoom,
        activeLayers,
        setSelectedMarker,
        setShowMarkerDialog,
      }),
    ],
    [markers, zoom, activeLayers, setSelectedMarker, setShowMarkerDialog],
  );

  const centroidLayers = useMemo(
    () => createCentroidLayers({ towns, zoom, activeLayers }),
    [towns, zoom, activeLayers],
  );

  const pickupsLayer = useMemo(
    () => createPickupLayers({
      pickups,
      zoom,
      activeLayers,
      setSelectedPickup,
      setShowInfoPickupDialog,
    }),
    [pickups, zoom, activeLayers, setSelectedPickup, setShowInfoPickupDialog],
  );

  const pulsingLayer = useMemo(
    () => userLocation && [
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
    layers: [...staticLayers, ...centroidLayers, ...pickupsLayer, ...(pulsingLayer || [])],
  };
};
