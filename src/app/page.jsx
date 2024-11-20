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
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { CodeCrudDialog } from '@/components/dialogs/code/CodeCrudDialog';
import { Button } from '@/components/ui/button';
import useIsAdmin from '@/hooks/useIsAdmin';

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
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState({
    latitude: null,
    longitude: null,
  });

  const [isWarningModalOpen, setWarningModalOpen] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [dialogChooseCreate, setDialogChooseCreate] = useState(false);

  const isAdmin = useIsAdmin();

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
        <div className="hidden xl:flex flex-col grow-2 max-h-dvh">
          <div className="p-2 flex gap-2 items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="som.svg" alt="logo-som" width={60} height={23} />
              {!isAdmin && (
                <Button
                  onClick={() => {
                    setShowAdminDialog(true);
                  }}
                  className="w-fit mt-0 text-[12px] rounded-xl font-mediumn m-0 p-0 min-h-[20px] h-[26px] px-2"
                >
                  <Icon
                    icon="charm:key"
                    width="20"
                    height="20"
                  />
                </Button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex gap-2 items-center">
                <Icon
                  icon="uiw:github"
                  width="20"
                  height="20"
                />
                <Link href="https://github.com/bgramaje" passHref target="_blank">
                  <Image
                    alt="github"
                    src="https://avatars.githubusercontent.com/u/56760866?s=400&u=85f1f7114a7c9f4afc1c63e3d06d35a7e204ce1a&v=4"
                    width={20}
                    height={20}
                    className="rounded-md p-0 bg-white"
                  />
                </Link>
                <code className="text-[11px] font-medium">bgramaje</code>
              </div>
              <Separator orientation="vertical" />
              <div className="flex gap-1 items-center">
                <Icon icon="ri:instagram-line" />
                <code className="text-[11px] font-medium">somvalencia.app</code>
              </div>
            </div>
          </div>
          <Separator />

          <div className="hidden xl:flex justify-between flex-1 overflow-auto">
            <MarkersList />
            <Separator orientation="vertical" />
            <PickupsList />
          </div>
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
    </CombinedProvider>
  );
}
