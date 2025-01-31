/* eslint-disable max-len */
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_VIEW_STATE, MARKER_STATUS, PICKUP_STATUS } from '@/lib/enums';

import { DeckGL } from '@deck.gl/react';
import { Map as ReactMap } from 'react-map-gl/maplibre';
import { useMarkers } from '@/context/MarkerContext';
import { usePickups } from '@/context/PickupContext';
import Link from 'next/link';
import Image from 'next/image';
import { useMapLayers } from '@/hooks/useMapLayers';
import { toast } from 'sonner';
import { useTowns } from '@/context/TownContext';
import { useMapStore } from '@/app/store';
import { isEmpty } from 'lodash';
import { Icon } from '@iconify/react';
import useIsAdmin from '@/hooks/useIsAdmin';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { ComboBoxResponsive } from './towns-selector';
import LayersFilter from './layers-filter';
import { LeftButtons } from './left-buttons';
import MapContent from './map-content';
import { Button } from '../ui/button';
import { CodeCrudDialog } from '../dialogs/code/CodeCrudDialog';
import { DrawerTree } from './drawers/drawer-tree';
import { AnimatedGradientText } from '../ui/animated-gradient-text';
import { DockSubactions } from './dock-subactions';
import { DrawerLegend } from './drawers/drawer-legend';

/*
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
*/

function MapView({
  setSelectedCoordinate,
  dialogChooseCreate,
  setDialogChooseCreate,
  setSelectedPickup,
  setSelectedMarker,
}) {
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [infoOpenDialog, setInfoOpenDialog] = useState(false);

  const globalViewState = useMapStore((state) => state.globalViewState);

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [activeLayers, setActiveLayers] = useState({
    ...Object.keys(MARKER_STATUS).reduce((acc, status) => {
      acc[`marker-${status.toLowerCase()}`] = true;
      return acc;
    }, {}),
    ...Object.keys(PICKUP_STATUS).reduce((acc, status) => {
      acc[`pickup-${status}`] = true;
      return acc;
    }, {}),
  });

  const [selectedTown, setSelectedTown] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const {
    markers, markersType, loading: loadingMarkers, setShowMarkerDialog,
  } = useMarkers();
  const { pickups, loading: loadingPickups } = usePickups();
  const { towns, loading: loadingTowns } = useTowns();

  const isAdmin = useIsAdmin();

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

  const getLocation = useCallback(() => {
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
  }, [setUserLocation, setViewState]);

  const onViewStateChange = useCallback(({ viewState: _v }) => setViewState(_v), []);

  const handleMapClick = useCallback((event) => {
    if (!isSelectingLocation || !event.coordinate) return;

    setSelectedCoordinate({
      longitude: event.coordinate[0],
      latitude: event.coordinate[1],
    });

    setIsSelectingLocation(false);

    if (isAdmin) setDialogChooseCreate(true);
    else setShowMarkerDialog(true);
  }, [isSelectingLocation, isAdmin, setIsSelectingLocation, setDialogChooseCreate, setShowMarkerDialog, setSelectedCoordinate]);

  const getCursor = useCallback(
    () => (isSelectingLocation ? 'crosshair' : 'grab'),
    [isSelectingLocation],
  );

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      latitude: selectedTown?.latitude ?? prev.latitude,
      longitude: selectedTown?.longitude ?? prev.longitude,
    }));
  }, [selectedTown]);

  useEffect(() => {
    if (isEmpty(globalViewState)) return;
    setViewState(globalViewState);
  }, [globalViewState]);

  return (
    <div className="relative h-dvh flex-1 grow-4">
      <DeckGL
        height="100dvh"
        viewState={viewState}
        controller
        layers={layers}
        onViewStateChange={onViewStateChange} // Escucha los cambios en viewState
        onClick={handleMapClick}
        getCursor={getCursor}
      >
        <ReactMap
          attributionControl={false}
          reuseMaps
          onClick={handleMapClick}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        />
      </DeckGL>

      <div
        onClick={() => window.open('https://www.vozpopuli.com/espana/comunidad-valenciana/comida-medicamentos-ropa-aplicacion-pedir-ayuda-dana-valencia.html', '_blank')}
        role="button"
        aria-hidden="true"
        className="z-10 absolute top-6 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        <AnimatedGradientText>
          🎉
          <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />
          <span
            className={cn(
              'mr-1 inline animate-gradient bg-gradient-to-r from-[#202020] via-[#40ff66] to-[#202020] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent',
            )}
          >
            Salimos en Vozpópuli
          </span>
          🗞️
          <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedGradientText>
      </div>

      <div className="absolute top-0 left-0 z-10 h-full p-2">
        <DrawerTree setViewState={setViewState} />
      </div>

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
        <div className="hidden xl:block" />
        <div className="flex flex-col gap-1 items-center xl:hidden">
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
          <Button
            onClick={() => setInfoOpenDialog(true)}
            variant="outline"
            size="icon"
            className="rounded-xl"
          >
            <Icon
              icon="ph:info-bold"
              className="text-red-300"
              style={{ color: 'black', width: 22, height: 22 }}
            />
          </Button>
          {!isAdmin && (
            <Button
              onClick={() => {
                setShowAdminDialog(true);
              }}
              className="w-fit mt-0 text-[12px] w-[32px] !h-[32px] rounded-xl font-mediumn m-0 p-0 min-h-[20px] h-[26px] px-2"
            >
              <Icon
                icon="charm:key"
                width="20"
                height="20"
              />
            </Button>
          )}
        </div>

        {/*
        <div className="p-0 m-0">
          <ComboBoxResponsive
            towns={towns}
            selectedTown={selectedTown}
            setSelectedTown={setSelectedTown}
          />
        </div>
        */}

        <div className="relative flex flex-col gap-1">
          <DockSubactions
            setViewState={setViewState}
            activeLayers={activeLayers}
            setActiveLayers={setActiveLayers}
          />
        </div>
      </div>

      <div className="absolute z-10 right-2 bottom-7">
        <DrawerLegend types={markersType} loading={loadingMarkers} />
      </div>

      <MapContent
        isSelectingLocation={isSelectingLocation}
        setIsSelectingLocation={setIsSelectingLocation}
        getLocation={getLocation}
        markersType={markersType}
        loading={loadingMarkers && loadingPickups && loadingTowns}
        dialogChooseCreate={dialogChooseCreate}
        setDialogChooseCreate={setDialogChooseCreate}
        infoOpenDialog={infoOpenDialog}
        setInfoOpenDialog={setInfoOpenDialog}
      />
      <CodeCrudDialog
        open={showAdminDialog}
        close={setShowAdminDialog}
        title="MODO ADMINISTRADOR"
        description="Facilita el código para entrar al modo administrador. Entrando en este modo podrñas
        editar informacion relativa a puntos de recogida"
        callback={(code) => {
          if (code === process.env.NEXT_PUBLIC_MASTER_KEY_PICKUPS) {
            sessionStorage.setItem('admin', JSON.stringify(true));
            window.dispatchEvent(new Event('storage'));
          }
          setShowAdminDialog(false);
        }}
      >
        <Button className="w-full mt-2 bg-green-500 uppercase text-[12px] font-semibold">
          <Icon
            icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
            width="20"
            height="20"
          />
          Aceptar
        </Button>
      </CodeCrudDialog>
    </div>
  );
}

export default MapView;
