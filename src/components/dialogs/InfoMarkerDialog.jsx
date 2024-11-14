import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { isEmpty } from 'lodash';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { formatDate } from '@/lib/date';
import { MARKER_STATUS } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { getAddress, getGoogleMapsUrl } from '@/lib/getAdress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { HelperDialog } from './HelperDialog';
import { MarkerBadge } from '../custom/marker-badge';
import { CodeCrudDialog } from './code/CodeCrudDialog';

export function InfoMarkerDialog({
  open,
  close,
  selectedMarker,
  deleteMarker,
  assignMarker,
  completeMarker,
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
            <DialogTitle className="uppercase font-bold text-[13px] flex items-center gap-1 justify-center flex-col gap-0">
              Información
              <MarkerBadge marker={marker} />
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-[12px] p-0 m-0 hidden">
              -
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 py-0 m-0 text-xs flex flex-col gap-1 ">
            <Alert className="text-xs border-zinc-200 px-3 py-1.5">
              <Accordion type="single" collapsible className="border-0">
                <AccordionItem value="item-1" className="border-0">
                  <AccordionTrigger className="p-0 border-0">
                    <AlertTitle className="uppercase text-[11px] m-0 p-0 font-medium">
                      POLÍTICAS DE PRIVACIDAD & AVISO LEGAL
                    </AlertTitle>
                  </AccordionTrigger>
                  <AccordionContent className="p-0 border-0">
                    <AlertDescription className="text-xs flex flex-col items-center gap-1 font-regular w-full">
                      {marker?.policy_accepted && (
                        <li>
                          {marker?.helper_name
                            ? 'Tanto solicitante como voluntario han aceptado las'
                            : 'El solicitante ha aceptado las'}
                          {' '}
                          <a href="/privacy-policy" className="text-blue-500 underline">políticas de privacidad</a>
                        </li>
                      )}
                      {marker?.data_usage && (
                        <li>
                          {marker?.helper_name
                            ? 'Tanto solicitante como voluntario han aceptado'
                            : 'El solicitante ha aceptado'}
                          {' '}
                          hacer visible la información introducida en el formulario.
                        </li>
                      )}
                    </AlertDescription>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Alert>
            {marker?.status === MARKER_STATUS.ASIGNADO && (
              <Alert className="text-xs border-orange-500 bg-orange-100 animate-pulse px-3 py-1.5">
                <Accordion type="multiple" className="border-0" defaultValue={['helper']}>
                  <AccordionItem value="helper" className="border-0">
                    <AccordionTrigger className="p-0 border-0">
                      <AlertTitle className="uppercase text-[11px] m-0 p-0 font-medium">
                        Voluntario Asignado
                      </AlertTitle>
                    </AccordionTrigger>
                    <AccordionContent className="p-0 border-0">
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Alert>
            )}
          </div>

          {marker?.img && (
            <div className="w-full p-1 px-4 rounded-xl overflow-auto">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src={marker.img}
                  alt="Preview"
                  className="h-full w-full rounded-md object-cover"
                  fill
                />
              </AspectRatio>
            </div>
          )}

          <div className="!text-[13px] font-semibold flex gap-2 items-center px-4">
            <Alert className="border-blue-200 bg-blue-100 px-3 py-1.5">
              <AlertTitle className="text-center text-[13px] flex items-center justify-between">
                <p className="uppercase text-[11px]">Descripción:</p>
                {formatDate(marker?.created_at)}
              </AlertTitle>
              <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-justify">
                {isEmpty(marker?.description) ? '-' : marker?.description}
              </AlertDescription>
            </Alert>
          </div>

          {direccion?.calle && (
            <div className="!text-[13px] font-semibold flex gap-2 items-center px-4">
              <Alert className="border-zinc-200 bg-zinc-100 px-3 py-1.5">
                <AlertTitle className="text-center text-[13px] flex items-center justify-between">
                  <p className="uppercase text-[11px]">Ubicación:</p>
                  <span className="uppercase">
                    {marker?.location?.name ?? direccion?.poblacion ?? '-'}
                  </span>
                </AlertTitle>
                <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-justify">
                  {direccion?.calle ?? '-'}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="p-4 pt-0 flex flex-col gap-1">
            <div className="flex gap-1 mt-0">
              {marker?.status !== MARKER_STATUS.COMPLETADO && (
                <Button
                  onClick={handleComplete}
                  className="w-full bg-green-500 uppercase text-[12px] font-semibold"
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
                className="w-full uppercase text-[12px] font-semibold"
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

            {(marker?.telf && marker?.status !== MARKER_STATUS.COMPLETADO) && (
              <div className="flex gap-1">
                <a href={`tel:${marker?.telf}`} className="flex-1">
                  <Button
                    className="w-full bg-blue-500 uppercase text-[12px] font-semibold"
                  >
                    <Icon
                      icon="solar:phone-calling-bold"
                      width="20"
                      height="20"
                    />
                    Llamar
                  </Button>
                </a>
                <a
                  href={`
                      https://wa.me/${marker.telf.replace('+', '')}?text=${
                    `📅 Fecha de solicitud: ${formatDate(marker.created_at)}%0A`
                        + `📝 Descripción: ${marker.description || 'No especificada'}%0A`
                        + `📍 Ubicación: ${marker?.location?.name ?? '-'}%0A`
                        + `🗺️ Ver en Google Maps: ${encodeURIComponent(
                          `https://www.google.com/maps?q=${marker.latitude},${marker.longitude}`,
                        )}`}
                    `}
                  target="_blank"
                  className="flex-1"
                  rel="noreferrer"
                >
                  <Button className="w-full bg-green-700 uppercase text-[12px] font-semibold flex-1">
                    <Icon icon="ic:outline-whatsapp" width="20" height="20" />
                    Hablar
                  </Button>
                </a>
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
          assignMarker(body, () => fetchMarker(selectedMarker.id));
        }}
      />

      <CodeCrudDialog
        open={showCodeDialog}
        close={setShowCodeDialog}
        selectedMarker={marker}
        callback={(code) => {
          deleteMarker(code);
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
        handleDeleteMarker={deleteMarker}
        selectedMarker={marker}
        callback={(code) => {
          completeMarker({ status: 'completado', code });
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
