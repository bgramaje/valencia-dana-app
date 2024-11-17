'use client';

import React, { useEffect, useState } from 'react';

import { InfoDialog } from '@/components/dialogs/InfoDialog';
import { WarningDialog } from '@/components/dialogs/WarningDialog';
import { PickupProvider } from '@/context/PickupContext';
import { MarkerProvider } from '@/context/MarkerContext';
import MapView from '@/components/map/map-view';
import { TownProvider } from '@/context/TownContext';
import { MarkersList } from '@/components/lists/MarkersList';
import { PickupsList } from '@/components/lists/PickupsList';
import { Separator } from '@/components/ui/separator';

/**
 * @name CombinedProvider
 * @description component for nesting different providers
 * @param {*} param0
 * @returns
 */
function CombinedProvider({
  children, selectedCoordinate, selectedMarker, setSelectedMarker, selectedPickup, setSelectedPickup,
}) {
  return (
    <TownProvider>
      <MarkerProvider
        location={selectedCoordinate}
        selectedMarker={selectedMarker}
        setSelectedMarker={setSelectedMarker}
      >
        <PickupProvider
          location={selectedCoordinate}
          selectedPickup={selectedPickup}
          setSelectedPickup={setSelectedPickup}
        >
          {children}
        </PickupProvider>
      </MarkerProvider>
    </TownProvider>
  );
}

export default function Home() {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState({
    latitude: null,
    longitude: null,
  });

  const [isWarningModalOpen, setWarningModalOpen] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [dialogChooseCreate, setDialogChooseCreate] = useState(false);

  const closeWarningModal = () => {
    setWarningModalOpen(false);
    localStorage.setItem('warningModalClosed', 'true');
  };

  useEffect(() => {
    const warningModalState = localStorage.getItem('warningModalClosed');
    setWarningModalOpen(warningModalState !== 'true');
  }, []);

  return (
    <CombinedProvider
      selectedCoordinate={selectedCoordinate}
      selectedMarker={selectedMarker}
      setSelectedMarker={setSelectedMarker}
      selectedPickup={selectedPickup}
      setSelectedPickup={setSelectedPickup}
    >
      <div className="w-dvh h-dvh flex">
        <MapView
          setSelectedCoordinate={setSelectedCoordinate}
          dialogChooseCreate={dialogChooseCreate}
          setDialogChooseCreate={setDialogChooseCreate}
          selectedPickup={selectedPickup}
          setSelectedPickup={setSelectedPickup}
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
        />
        <div className="hidden xl:flex grow-2">
          <MarkersList />
          <Separator orientation="vertical" />
          <PickupsList />
        </div>

      </div>

      <InfoDialog
        open={isInfoOpen}
        close={setIsInfoOpen}
      />

      <WarningDialog
        isWarningModalOpen={isWarningModalOpen}
        closeWarningModal={closeWarningModal}
      />
    </CombinedProvider>
  );
}
