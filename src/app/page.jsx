'use client';

import React, { useState, useEffect } from 'react';
import { Map as ReactMap } from 'react-map-gl/maplibre';
import { DeckGL } from '@deck.gl/react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { WarningDialog } from '@/components/dialogs/WarningDialog';
import { InfoDialog } from '@/components/dialogs/InfoDialog';
import { INITIAL_VIEW_STATE } from '@/lib/enums';
import { CreateDialog } from '@/components/dialogs/CreateDialog';
import { InfoMarkerDialog } from '@/components/dialogs/InfoMarkerDialog';
import { useMapLayers } from '@/hooks/useMapLayers';
import { Legend } from '@/components/map/legend';
import { ActionButtons } from '@/components/map/action-buttons';

export default function Home() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const [newMarker, setNewMarker] = useState({
    type: 'WATER',
    description: '',
    longitude: 0,
    latitude: 0,
  });

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isWarningModalOpen, setWarningModalOpen] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const {
    markers, setMarkers, layers, fetchMarkers,
  } = useMapLayers(userLocation, setSelectedMarker, setModalOpen);

  const closeWarningModal = () => {
    setWarningModalOpen(false);
    localStorage.setItem('warningModalClosed', 'true');
  };

  const handleMapClick = (event) => {
    if (isSelectingLocation && event.coordinate) {
      setNewMarker({
        ...newMarker,
        longitude: event.coordinate[0],
        latitude: event.coordinate[1],
      });
      setIsSelectingLocation(false);
      setModalOpen(true);
    }
  };

  const handleAddMarker = (body) => {
    fetch('/api/markers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...newMarker, ...body }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMarkers((prevMarkers) => [...prevMarkers, data]); // Actualiza los marcadores en el estado
        setNewMarker({
          type: 'WATER', description: '', longitude: 0, latitude: 0,
        }); // Reinicia el nuevo marcador
        setModalOpen(false);
      })
      .catch((error) => toast.error(`Error adding marker: ${error}`));
  };

  const handleCompleteMarker = (code) => {
    fetch(`/api/markers/${selectedMarker.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: selectedMarker.id, status: 'completado', code }), // Envía el índice o ID
    })
      .then((response) => response.json())
      .then(() => {
        setModalOpen(false);
        setSelectedMarker(null);
        fetchMarkers();
      })
      .catch((error) => toast.error(`Error completing marker: ${error}`));
  };

  const handleDeleteMarker = (code) => {
    fetch('/api/markers', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: selectedMarker.id, code }), // Envía el índice o ID
    })
      .then((response) => response.json())
      .then(() => {
        // Actualiza la lista de marcadores
        const updatedMarkers = markers.filter((marker) => marker !== selectedMarker);
        setMarkers(updatedMarkers);
        setModalOpen(false);
        setSelectedMarker(null);
      })
      .catch((error) => toast.error(`Error deleting marker: ${error}`));
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
    if (!isModalOpen) setSelectedMarker(null);
  }, [isModalOpen]);

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
          mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=3l2Dsb6tXQ0t2OzWLivd"
          onClick={handleMapClick}
        />
      </DeckGL>

      <div className="flex absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-4">
        <div className="bg-white p-2 py-2 m-0 rounded-xl shadow flex gap-1 flex-wrap justify-between">
          <span className="font-semibold text-[13px] uppercase leading-tight text-blue-500 text-center font-bold">
            Total Marcadores:
            {markers.length}
          </span>
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
            handleCompleteMarker={handleCompleteMarker}
          />
        )
        : (
          <CreateDialog
            open={isModalOpen}
            close={setModalOpen}
            newMarker={newMarker}
            handleAddMarker={handleAddMarker}
            setNewMarker={setNewMarker}
          />
        )}

      <div
        className="flex absolute bottom-0 left-1/2 transform -translate-x-1/2 items-center gap-1
        flex-col-reverse md:flex-row -translate-y-4 md:-translate-y-1/2 "
      >
        <Legend />
        <ActionButtons
          isSelectingLocation={isSelectingLocation}
          setIsSelectingLocation={setIsSelectingLocation}
          getLocation={getLocation}
          setIsInfoOpen={setIsInfoOpen}
        />
        <Link href="https://github.com/bgramaje" passHref className="ml-1 hidden lg:block">
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

    </div>
  );
}
