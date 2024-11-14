import React, { useState, useEffect } from 'react';
import { INITIAL_VIEW_STATE, MARKER_STATUS } from '@/lib/enums';

import { DeckGL } from '@deck.gl/react';
import { Map as ReactMap } from 'react-map-gl/maplibre';
import { useMarkers } from '@/context/MarkerContext';
import { usePickups } from '@/context/PickupContext';
import Link from 'next/link';
import Image from 'next/image';
import { useMapLayers } from '@/hooks/useMapLayers';
import { toast } from 'sonner';
import { useTowns } from '@/context/TownContext';
import { ComboBoxResponsive } from './towns-selector';
import LayersFilter from './layers-filter';
import { LeftButtons } from './left-buttons';
import MapContent from './map-content';

const mapStyle = {
  version: 8,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 180,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'raster-tiles',
      minzoom: 0,
      maxzoom: 24,
    },
  ],
};

function MapView({
  setSelectedCoordinate,
  dialogChooseCreate,
  setDialogChooseCreate,
  setSelectedPickup,
  setSelectedMarker,
}) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [activeLayers, setActiveLayers] = useState({
    AFECTADO: true,
    PUNTO: true,
  });

  const [selectedTown, setSelectedTown] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const { markers, markersType, loading: loadingMarkers } = useMarkers();
  const { pickups, loading: loadingPickups } = usePickups();
  const { towns, loading: loadingTowns } = useTowns();

  const {
    layers,
  } = useMapLayers({
    markers,
    pickups,
    towns,
    userLocation,
    setSelectedMarker,
    setSelectedPickup,
    viewState,
    activeLayers,
  });

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        setViewState((prev) => ({
          ...prev,
          latitude,
          longitude,
          zoom: 13, // Ajusta el nivel de zoom inicial
        }));
      },
      (error) => toast.error(`Error getting location: ${error}`),
      { enableHighAccuracy: true },
    );
  };

  const onViewStateChange = ({ viewState: _v }) => setViewState(_v);

  const handleMapClick = (event) => {
    if (isSelectingLocation && event.coordinate) {
      setSelectedCoordinate({
        longitude: event.coordinate[0],
        latitude: event.coordinate[1],
      });

      setIsSelectingLocation(false);
      setDialogChooseCreate(true);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      latitude: selectedTown?.latitude ?? prev.latitude,
      longitude: selectedTown?.longitude ?? prev.longitude,
    }));
  }, [selectedTown]);

  return (
    <div className="relative w-full h-dvh">
      <DeckGL
        height="100dvh"
        viewState={viewState}
        controller
        layers={layers}
        onViewStateChange={onViewStateChange} // Escucha los cambios en viewState
        onClick={handleMapClick}
        getCursor={() => (isSelectingLocation ? 'crosshair' : 'grab')}
      >
        <ReactMap
          attributionControl={false}
          reuseMaps
          onClick={handleMapClick}
          mapStyle={mapStyle}
        />
      </DeckGL>

      <div className="absolute bottom-1 right-2 text-[10px] bg-white px-1 rounded xl">
        <p>
          &copy;
          <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
          {' '}
          contributors
        </p>
      </div>

      <div
        className="w-full px-3 flex absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-start gap-4 justify-between"
      >
        <div className="flex flex-col gap-1 items-center xl:hidden md:hidden">
          <Link href="https://github.com/bgramaje" passHref target="_blank">
            <Image
              alt="github"
              src="https://avatars.githubusercontent.com/u/56760866?s=400&u=85f1f7114a7c9f4afc1c63e3d06d35a7e204ce1a&v=4"
              width={36}
              height={36}
              className="rounded-xl p-1 bg-white"
            />
          </Link>
          <div className="font-semibold text-[13px] bg-white p-1 rounded-xl w-[32px] h-[32px] flex items-center justify-center">
            {markers.filter((m) => m.status !== MARKER_STATUS.COMPLETADO).length}
          </div>
        </div>

        <div className="p-0 m-0">
          <ComboBoxResponsive
            towns={towns}
            selectedTown={selectedTown}
            setSelectedTown={setSelectedTown}
          />
        </div>
        <div className="relative flex flex-col gap-1">
          <LayersFilter
            activeLayers={activeLayers}
            setActiveLayers={setActiveLayers}
          />
          <LeftButtons setViewState={setViewState} />
        </div>
      </div>

      <MapContent
        isSelectingLocation={isSelectingLocation}
        setIsSelectingLocation={setIsSelectingLocation}
        getLocation={getLocation}
        markersType={markersType}
        loading={loadingMarkers && loadingPickups && loadingTowns}
        dialogChooseCreate={dialogChooseCreate}
        setDialogChooseCreate={setDialogChooseCreate}
      />
    </div>
  );
}

export default MapView;