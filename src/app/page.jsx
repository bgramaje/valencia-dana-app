'use client';

import React, { useState, useEffect } from 'react';
import { Map as ReactMap } from 'react-map-gl/maplibre';
import { DeckGL } from '@deck.gl/react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { WarningDialog } from '@/components/dialogs/WarningDialog';
import { InfoDialog } from '@/components/dialogs/InfoDialog';
import { INITIAL_VIEW_STATE, MARKER_STATUS, TOAST_ERROR_CLASSNAMES } from '@/lib/enums';
import { CreateDialog } from '@/components/dialogs/CreateDialog';
import { InfoMarkerDialog } from '@/components/dialogs/InfoMarkerDialog';
import { useMapLayers } from '@/hooks/useMapLayers';
import { ActionButtons } from '@/components/map/action-buttons';
import { fetcher } from '@/lib/utils';
import LayersFilter from '@/components/map/layers-filter';
import { LeftButtons } from '@/components/map/left-buttons';
import { ComboBoxResponsive } from '@/components/map/towns-selector';
import { InfoPickerDialog } from '@/components/dialogs/InfoPickerDialog';
import ChooseCreateDialog from '@/components/dialogs/ChooseCreateDialog';
import { CreatePickupDialog } from '@/components/dialogs/CreatePickupDialog';
import { CodeCrudDialog } from '@/components/dialogs/code/CodeCrudDialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

const STYLE = {
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

export default function Home() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const [activeLayers, setActiveLayers] = useState({
    AFECTADO: true,
    VOLUNTARIO: true,
    PUNTO: true,
  });

  const [newMarker, setNewMarker] = useState({
    type: 'WATER',
    description: '',
    longitude: 0,
    latitude: 0,
  });

  const [newPickup, setNewPickup] = useState({
    longitude: 0,
    latitude: 0,
  });

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const [selectedPickup, setSelectedPickup] = useState(null);
  const [modalPickupOpen, setModalPickupOpen] = useState(false);

  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isWarningModalOpen, setWarningModalOpen] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [dialogChooseCreate, setDialogChooseCreate] = useState(false);
  const [dialogPickupCreate, setDialogPickupCreate] = useState(false);
  const [dialogCodePickup, setDialogCodePickup] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedTown, setSelectedTown] = useState(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState({ latitude: null, longitude: null });

  const {
    markers,
    markersType,
    towns,
    loading,
    setMarkers,
    layers,
    fetchMarkers,
    key,
    setPickups,
  } = useMapLayers(
    userLocation,
    setSelectedMarker,
    setSelectedPickup,
    setModalOpen,
    setModalPickupOpen,
    viewState,
    activeLayers,
  );

  const closeWarningModal = () => {
    setWarningModalOpen(false);
    localStorage.setItem('warningModalClosed', 'true');
  };

  const codePickupCallback = (inputCode) => {
    if (inputCode === key.key) {
      setNewPickup({
        ...newPickup,
        ...selectedCoordinate,
      });
      setDialogCodePickup(false);
      setDialogPickupCreate(true);
    } else {
      toast.error('Código incorrecto', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
    }
  };

  const openCreateDialog = (markerType) => {
    setIsSelectingLocation(false);

    if (markerType === 'AFECTADO') {
      setNewMarker({
        ...newMarker,
        ...selectedCoordinate,
      });
      setModalOpen(true);
    } else {
      setDialogCodePickup(true);
    }
  };

  const handleMapClick = (event) => {
    if (isSelectingLocation && event.coordinate) {
      setSelectedCoordinate({
        longitude: event.coordinate[0],
        latitude: event.coordinate[1],
      });
      /*
      setNewMarker({
        ...newMarker,
        longitude: event.coordinate[0],
        latitude: event.coordinate[1],
      });
      setIsSelectingLocation(false);
      setModalOpen(true);
      */
      setIsSelectingLocation(false);
      setDialogChooseCreate(true);
    }
  };

  const handleAddMarker = (body) => {
    fetcher('/api/markers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newMarker, ...body }),
    }, 'Marcador creado correctamente')
      .then((data) => {
        setMarkers((prevMarkers) => [...prevMarkers, data]);
        setNewMarker({
          type: 'WATER', description: '', longitude: 0, latitude: 0,
        });
        setModalOpen(false);
      });
  };

  const handleAddPickup = (body) => {
    fetcher('/api/pickups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newPickup, ...body }),
    }, 'Punto de recogida creado correctamente')
      .then((data) => {
        setPickups((prevMarkers) => [...prevMarkers, data]);
        setNewPickup({
          status: 'DESCONOCIDO', description: '', longitude: 0, latitude: 0,
        });
        setDialogPickupCreate(false);
      });
  };

  const handleAssignMarker = (body, cb = undefined) => {
    fetcher(`/api/markers/assign/${selectedMarker.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedMarker.id, ...body }),
    }, 'Marcador asignado correctamente')
      .then((data) => {
        setSelectedMarker(data);
        fetchMarkers();
        if (cb) cb();
      });
  };

  const handleCompleteMarker = (body) => {
    fetcher(`/api/markers/complete/${selectedMarker.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedMarker.id, ...body }),
    }, 'Marcador completado correctamente')
      .then(() => {
        fetchMarkers();
      });
  };

  const handleDeleteMarker = (code) => {
    fetcher('/api/markers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedMarker.id, code }),
    }, 'Marcador borrado correctamente')
      .then(() => {
        setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker !== selectedMarker));
        setModalOpen(false);
        setSelectedMarker(null);
      });
  };

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

  const onViewStateChange = ({ viewState: _v }) => {
    setViewState(_v);
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    const warningModalState = localStorage.getItem('warningModalClosed');
    setWarningModalOpen(warningModalState !== 'true');
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedMarker(null);
      setNewMarker({
        type: 'WATER',
        description: '',
        longitude: 0,
        latitude: 0,
        telf: '',
      });
    }
  }, [isModalOpen]);

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
          mapStyle={STYLE}
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

      {isSelectingLocation && (
        <div className="flex absolute top-[90px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-4">
          <div className="bg-white p-2 py-2 m-0 rounded-xl shadow flex gap-1 flex-wrap justify-between">
            <span
              className="font-semibold text-[13px] uppercase leading-tight text-red-500 animate-pulse text-center"
            >
              Añadiendo marcador: Seleccione coordenada
            </span>
          </div>
        </div>
      )}

      {/* Modal de advertencia que aparece por defecto */}
      <WarningDialog
        isWarningModalOpen={isWarningModalOpen}
        closeWarningModal={closeWarningModal}
      />

      {selectedMarker
        ? (
          <InfoMarkerDialog
            open={isModalOpen}
            close={setModalOpen}
            selectedMarker={selectedMarker}
            handleDeleteMarker={handleDeleteMarker}
            handleAssignMarker={handleAssignMarker}
            handleCompleteMarker={handleCompleteMarker}
          />
        )
        : (
          <CreateDialog
            open={isModalOpen}
            close={setModalOpen}
            newMarker={newMarker}
            markersType={markersType}
            handleAddMarker={handleAddMarker}
            setNewMarker={setNewMarker}
          />
        )}

      <CreatePickupDialog
        newPickup={newPickup}
        open={dialogPickupCreate}
        close={setDialogPickupCreate}
        setNewPickup={setNewPickup}
        handleAddPickup={handleAddPickup}
      />

      <div
        className="flex absolute bottom-3 left-1/2 transform -translate-x-1/2 items-center gap-1
        flex-col-reverse md:flex-row -translate-y-4 md:-translate-y-1/2 "
      >
        {/*
                <Legend types={markersType} loading={loading} />

        */}
        <ActionButtons
          isSelectingLocation={isSelectingLocation}
          setIsSelectingLocation={setIsSelectingLocation}
          getLocation={getLocation}
          setIsInfoOpen={setIsInfoOpen}
          types={markersType}
          loading={loading}
        />
        <Link target="_blank" href="https://github.com/bgramaje" passHref className="ml-1 hidden lg:block">
          <Image
            alt="github"
            src="https://avatars.githubusercontent.com/u/56760866?s=400&u=85f1f7114a7c9f4afc1c63e3d06d35a7e204ce1a&v=4"
            width={50}
            height={50}
            className="rounded-xl p-1 bg-white hidden md:block"
          />
        </Link>
      </div>

      {/* Modal de advertencia que aparece por defecto */}
      <InfoDialog
        open={isInfoOpen}
        close={() => setIsInfoOpen(false)}
      />

      <ChooseCreateDialog
        open={dialogChooseCreate}
        setOpen={setDialogChooseCreate}
        cb={openCreateDialog}
      />

      {selectedPickup && (
        <InfoPickerDialog
          selectedPickup={selectedPickup}
          open={modalPickupOpen}
          close={setModalPickupOpen}
        />
      )}

      <CodeCrudDialog
        open={dialogCodePickup}
        lose={setDialogCodePickup}
        callback={codePickupCallback}
      >
        <Button className="w-full mt-2 bg-green-500 uppercase text-[12px] font-semibold">
          <Icon
            icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
            width="20"
            height="20"
          />
          Enviar
        </Button>
      </CodeCrudDialog>
    </div>
  );
}
