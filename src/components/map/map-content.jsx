'use client';

import { usePickups } from '@/context/PickupContext';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMarkers } from '@/context/MarkerContext';
import { ActionButtons } from './action-buttons';
import ChooseCreateDialog from '../dialogs/ChooseCreateDialog';
import { InfoDialog } from '../dialogs/InfoDialog';

function MapContent({
  getLocation,
  isSelectingLocation,
  setIsSelectingLocation,
  markersType,
  loading,
  dialogChooseCreate,
  setDialogChooseCreate,
}) {
  const [infoOpenDialog, setInfoOpenDialog] = useState(false);

  const { setShowCodeDialog: showKeyDialog } = usePickups();
  const { setShowMarkerDialog } = useMarkers();

  const openCreateDialog = (markerType) => {
    setIsSelectingLocation(false);
    if (markerType === 'AFECTADO') {
      setShowMarkerDialog(true);
    } else {
      showKeyDialog(true);
    }
  };

  return (
    <>
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

      <div
        className="flex absolute bottom-3 left-1/2 transform -translate-x-1/2 items-center gap-1
        flex-col-reverse md:flex-row -translate-y-4 md:-translate-y-1/2 "
      >
        <ActionButtons
          isSelectingLocation={isSelectingLocation}
          setIsSelectingLocation={setIsSelectingLocation}
          getLocation={getLocation}
          setIsInfoOpen={setInfoOpenDialog}
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

      <ChooseCreateDialog
        open={dialogChooseCreate}
        setOpen={setDialogChooseCreate}
        cb={openCreateDialog}
      />

      <InfoDialog
        open={infoOpenDialog}
        close={() => setInfoOpenDialog(false)}
      />
    </>
  );
}

export default MapContent;
