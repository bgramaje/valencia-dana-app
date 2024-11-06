import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ASSISTANCE_TYPES, DATE_OPTIONS, MARKER_STATUS } from '@/lib/enums';
import { getAddress, getGoogleMapsUrl } from '@/lib/getAdress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

import { isEmpty } from 'lodash';
import { CodeCrudDialog } from './code/CodeCrudDialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { HelperDialog } from './HelperDialog';
import { MarkerBadge } from '../custom/marker-badge';

export function InfoMarkerDialog({
  open, close, selectedMarker, handleDeleteMarker, handleAssignMarker, handleCompleteMarker,
}) {
  const [showHelperDialog, setShowHelperDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(true);

  const [direccion, setDireccion] = useState({
    calle: null,
    poblacion: null,
    direccionCompleta: null,
  });

  const fetchMarker = (id) => {
    fetch(`/api/markers/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setMarker(data);
        setLoading(false);
      })
      .catch((error) => toast.error(`Error loading marker ${error}`));
  };

  useEffect(() => {
    setLoading(true);
    const fetchAddress = async () => {
      const addressData = await getAddress(selectedMarker.latitude, selectedMarker.longitude);
      setDireccion(addressData);
      fetchMarker(selectedMarker.id);
    };

    fetchAddress();
  }, [selectedMarker.id, selectedMarker.latitude, selectedMarker.longitude]);

  const handleDelete = () => setShowCodeDialog(true);
  const handleComplete = () => setShowCompleteDialog(true);
  const handleHelper = () => setShowHelperDialog(true);

  const handleWhatsapp = () => {
    // Redirige a WhatsApp con el número proporcionado

    const whatsappUrl = `https://wa.me/${marker.telf.replace('+', '')}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading || marker === null || marker === undefined) {
    return (
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl p-0">
          <DialogHeader className="pt-4">
            <DialogTitle className="uppercase font-bold text-[13px] flex flex-col items-center gap-1">
              Información
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-[12px] p-0 m-0 hidden">
              -
            </DialogDescription>
          </DialogHeader>
          <div className="w-full flex items-center justify-center h-[170px]">
            <Icon
              icon="line-md:loading-loop"
              width="30"
              height="30"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl p-0 overflow-y-auto max-h-[90%] gap-2">
          <DialogHeader className="pt-4">
            <DialogTitle className="uppercase font-bold text-[13px] flex items-center gap-1 justify-center">
              Información
              <MarkerBadge marker={marker} />
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-[12px] p-0 m-0 hidden">
              -
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 py-0 m-0 text-xs flex flex-col gap-1">
            <Alert className="text-xs">
              <AlertDescription className="text-xs">
                {marker?.policy_accepted && (
                  <li>
                    Tanto solicitante como voluntario han aceptado las
                    {' '}
                    <a href="/privacy-policy" className="text-blue-500 underline">políticas de privacidad</a>
                  </li>
                )}
                {marker?.data_usage && (
                  <li>
                    Tanto solicitante como voluntario han aceptado  hacer visible la información introducida en el formulario.
                    {' '}
                  </li>
                )}
              </AlertDescription>
            </Alert>
            {marker?.status === MARKER_STATUS.ASIGNADO && (
              <Alert className="text-xs border-orange-500 bg-orange-100 animate-pulse">
                <AlertTitle className="uppercase text-[11px] m-0 p-0 font-medium">
                  Voluntario Asignado
                </AlertTitle>
                <AlertDescription className="text-xs flex items-center gap-1 font-semibold">
                  <Icon
                    icon="akar-icons:person"
                    width="16"
                    height="16"
                  />
                  <p className="uppercase flex gap-1">
                    <span>
                      {marker?.helper_name}
                    </span>
                    <span>
                      /
                    </span>
                    <span>
                      {marker?.helper_telf}
                    </span>
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {marker?.img && (
            <div className="w-full p-1 px-4 rounded-xl max-h-52 overflow-auto">
              <Image
                src={marker.img}
                alt="Preview"
                className="max-h-33 mx-auto rounded-xl"
                width={100}
                height={100} // Ajusta el aspect ratio
                style={{ width: 'fit-content', height: 'auto' }}
                priority
              />
            </div>
          )}

          <div className="p-4 pt-0 flex flex-col gap-1">
            <div className="flex gap-1 items-center text-md font-medium">
              <Badge className="w-[80px] bg-zinc-700">Tipo:</Badge>
              <Icon
                icon={ASSISTANCE_TYPES[marker?.type]?.icon}
                width="20"
                height="20"
              />
              <p className="text-[14px] font-semibold">{ASSISTANCE_TYPES[marker?.type]?.label}</p>
            </div>

            <div className="text-[14px] font-semibold flex gap-2 items-center">
              <Badge className="w-[80px] bg-zinc-700">Ayuda</Badge>
              <p className="w-[73%]">
                {isEmpty(marker?.description) ? '-' : marker?.description}
              </p>
            </div>
            <div className="text-[14px] font-semibold flex gap-2 items-center">
              <Badge className="w-[80px] bg-zinc-700">Teléfono</Badge>
              {isEmpty(marker?.telf) ? '-' : marker?.telf}
            </div>
            <div className="text-[14px] font-semibold flex gap-2 items-center">
              <Badge className="w-[80px] bg-zinc-700">Creado</Badge>
              {new Intl.DateTimeFormat('es-ES', DATE_OPTIONS).format(new Date(marker?.created_at))}
            </div>

            {direccion?.calle && (
              <div className="flex flex-col gap-1">
                <div className="text-[14px] font-semibold flex gap-2 items-center">
                  <Badge className="w-[80px] bg-zinc-700">Calle</Badge>
                  {direccion?.calle}
                </div>
                <div className="text-[14px] font-semibold flex gap-2 items-center">
                  <Badge className="w-[80px] bg-zinc-700">Población</Badge>
                  {direccion?.poblacion}
                </div>
              </div>
            )}

            <div className="flex gap-1">
              {marker?.status === MARKER_STATUS.ASIGNADO && (
                <Button
                  onClick={handleComplete}
                  className="w-full mt-2 bg-green-500 uppercase text-[12px] font-semibold"
                >
                  <Icon
                    icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
                    width="20"
                    height="20"
                  />
                  Completar
                </Button>
              )}
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="w-full mt-2 uppercase text-[12px] font-semibold"
              >
                <Icon
                  icon="ic:twotone-delete"
                  width="20"
                  height="20"
                />
                Eliminar
              </Button>
            </div>

            {marker?.status === MARKER_STATUS.PENDIENTE && (
              <Button
                onClick={handleHelper}
                className="w-full bg-orange-500 uppercase text-[12px] font-semibold"
              >
                <Icon
                  icon="akar-icons:person"
                  width="20"
                  height="20"
                />
                Ofrecerme voluntario
              </Button>
            )}

            {marker?.telf && (
              <div className="flex gap-2">
                <a href={`tel:${marker?.telf}`} className="w-full">
                  <Button
                    className="w-full bg-blue-500 uppercase text-[12px] font-semibold grow-1"
                  >
                    <Icon
                      icon="solar:phone-calling-bold"
                      width="20"
                      height="20"
                    />
                    Llamar
                  </Button>
                </a>
                <Button
                  onClick={handleWhatsapp}
                  className="w-full bg-green-700 uppercase text-[12px] font-semibold grow-1"
                >
                  <Icon
                    icon="ic:outline-whatsapp"
                    width="20"
                    height="20"
                  />
                  Hablar
                </Button>
              </div>
            )}

            <Button
              onClick={() => window.open(getGoogleMapsUrl(marker), '_blank')}
              className="w-full mt-0.5"
            >
              <Icon
                icon="mingcute:location-fill"
                width="20"
                height="20"
              />
              Abrir en Google Maps
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <HelperDialog
        open={showHelperDialog}
        close={setShowHelperDialog}
        selectedMarker={marker}
        callback={(body) => {
          setShowHelperDialog(false);
          handleAssignMarker(body, () => fetchMarker(selectedMarker.id));
        }}
      />

      <CodeCrudDialog
        open={showCodeDialog}
        close={setShowCodeDialog}
        selectedMarker={marker}
        callback={(code) => {
          handleDeleteMarker(code);
          close(false);
        }}
      >
        <Button
          variant="destructive"
          className="w-full mt-2 uppercase text-[12px] font-semibold"
        >
          <Icon
            icon="ic:twotone-delete"
            width="20"
            height="20"
          />
          Eliminar
        </Button>
      </CodeCrudDialog>

      <CodeCrudDialog
        open={showCompleteDialog}
        close={setShowCompleteDialog}
        handleDeleteMarker={handleDeleteMarker}
        selectedMarker={marker}
        callback={(code) => {
          handleCompleteMarker({ status: 'completado', code });
          close(false);
        }}
      >
        <Button className="w-full mt-2 bg-green-500 uppercase text-[12px] font-semibold">
          <Icon
            icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
            width="20"
            height="20"
          />
          Completar
        </Button>
      </CodeCrudDialog>
    </>
  );
}
