import React, { useEffect, useState } from 'react';

import { isEmpty, omit } from 'lodash';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/date';
import { getGoogleMapsUrl } from '@/lib/getAdress';
import { Icon } from '@iconify/react';

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '../ui/slider';
import { NeedsAddDialog } from './pickup/NeedsAddDialog';
import { NeedsSliderDialog } from './pickup/NeedsSliderDialog';

function TelephoneButtons({ telf, pickup }) {
  return (
    <div className="flex gap-1">
      <a href={`tel:${telf}`} className="flex-1">
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
        https://wa.me/${telf.replace('+', '')}?text=${
          `📝 Punto de recogida: ${pickup.name || 'No especificado'}%0A`
          + `📍 Ubicación: ${pickup?.location?.name ?? '-'}%0A`
          + `🗺️ Ver en Google Maps: ${encodeURIComponent(
            `https://www.google.com/maps?q=${pickup.latitude},${pickup.longitude}`,
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
  );
}

export function NeedSliderDisplay(props) {
  const { label, icon, value } = props;

  return (
    <div
      key={label}
      className={`
        flex items-center mb-0 gap-1.5 flex-1 bg-zinc-50
        rounded-xl border border-zinc-200 p-2 pb-3
      `}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center">
        <Icon icon={icon} style={{ color: '#202020', width: 20, height: 20 }} />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="w-full flex justify-between">
          <span className="font-semibold text-[12px] uppercase leading-tight">{label}</span>
          <span className="text-xs font-medium text-gray-600">{`${value}%`}</span>
        </div>

        <Slider
          value={[value]}
          max={100}
          step={1}
          disabled
        />
      </div>
    </div>
  );
}

function BaseDialogHeader({ pickup }) {
  return (
    <DialogHeader className="pt-4">
      <DialogTitle className="uppercase font-bold text-[13px] flex flex-col items-center justify-center gap-1">
        Información
        <div className="flex gap-1 items-center font-medium text-xs">
          <Icon
            icon="fluent:hourglass-three-quarter-16-regular"
            style={{ width: 14, height: 14 }}
          />
          {pickup?.created_at && formatDate(pickup?.created_at)}
        </div>
      </DialogTitle>
      <DialogDescription className="text-center font-medium text-[12px] p-0 m-0 hidden">
        -
      </DialogDescription>
    </DialogHeader>
  );
}

//       {pickup && <PickupStatus pickup={pickup} PICKUP_STATUS={PICKUP_STATUS} />}

export function InfoPickerDialog({
  open, close, selectedPickup, needsDB, fetchPickup, updatePickup,
}) {
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNeeds, setSelectedNeeds] = React.useState([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      fetchPickup(selectedPickup.id, (data) => {
        setLoading(false);
        setPickup(data);
        setSelectedNeeds(data.needs);
      });
    };

    if (!isEmpty(selectedPickup)) fetch();
  }, [selectedPickup, fetchPickup]);

  if (loading || isEmpty(pickup)) {
    return (
      <Dialog open={open} onOpenChange={close}>
        <DialogContent
          className="max-w-[90%] md:max-w-[450px] w-fit min-w-[350px] md:min-w-[400px] rounded-xl p-0 overflow-y-auto max-h-[90%] gap-2"
        >
          <BaseDialogHeader pickup={null} />
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
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        className="max-w-[90%] md:max-w-[450px] w-fit min-w-[350px] md:min-w-[400px] rounded-xl p-0 overflow-y-auto max-h-[90%] gap-2"
      >
        <BaseDialogHeader pickup={pickup} />
        <div className="px-4">
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
                    {pickup?.policy_accepted && (
                    <li>
                      El responsable ha aceptado las&nbsp;
                      <a href="/privacy-policy" className="text-blue-500 underline">políticas de privacidad</a>
                    </li>
                    )}

                  </AlertDescription>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Alert>
        </div>

        <div className="!text-[13px] font-semibold flex gap-2 items-center px-4">
          <Alert className="border-blue-200 bg-blue-100 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
              <p className="uppercase text-[11px]">Punto de Recogida:</p>
            </AlertTitle>
            <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-justify flex gap-0.5">
              {isEmpty(pickup?.name) ? '-' : pickup?.name}
              {(pickup && pickup.verified) && (
              <Icon
                icon="solar:verified-check-bold"
                style={{ width: 20, height: 20 }}
                className="text-blue-700"
              />
              )}
            </AlertDescription>
          </Alert>
        </div>

        {!isEmpty(pickup.responsable_nombre) && (
        <div className="!text-[13px] font-semibold flex gap-2 items-center px-4">
          <Alert className="border-green-200 bg-green-100 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
              <p className="uppercase text-[11px]">Responsable:</p>
              <div className="flex gap-1 items-center">
                {isEmpty(pickup?.responsable_nombre) ? '-' : pickup?.responsable_nombre}
              </div>
            </AlertTitle>
          </Alert>
        </div>
        )}

        <div className="!text-[13px] font-semibold flex gap-2 items-center px-4">
          <Alert className="border-zinc-200 bg-zinc-100 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
              <p className="uppercase text-[11px]">Ubicación:</p>
              <span className="uppercase">
                {pickup?.location?.name ?? '-'}
              </span>
            </AlertTitle>
            <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto">
              {pickup?.address ?? '-'}
            </AlertDescription>
          </Alert>
        </div>
        <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0 px-4">
          <p className="uppercase text-[11px]">Recogen :</p>
        </AlertTitle>
        <div className="flex flex-col w-full gap-1.5 p-4 py-1 pt-0 max-h-[280px] overflow-y-auto">
          {!isEmpty(needsDB) && (selectedNeeds ?? []).map((need) => {
            const needDB = needsDB.find((n) => n.key === need.key);
            if (!needDB) return null;
            return (
              <NeedSliderDisplay
                key={needDB.key}
                {...omit(needDB, ['key'])}
                value={need?.value ?? 0}
              />
            );
          })}
        </div>
        <div className="p-4 pt-0 flex flex-col gap-1">
          {!isEmpty(pickup.responsable_telf) && (
          <TelephoneButtons telf={pickup.responsable_telf} pickup={pickup} />
          )}

          <NeedsAddDialog
            pickup={pickup}
            setPickup={setPickup}
            updatePickup={updatePickup}
            needs={needsDB}
            selectedNeeds={selectedNeeds ?? []}
            setSelectedNeeds={setSelectedNeeds}
          />

          <NeedsSliderDialog
            pickup={pickup}
            setPickup={setPickup}
            updatePickup={updatePickup}
            needs={needsDB}
            selectedNeeds={selectedNeeds ?? []}
            setSelectedNeeds={setSelectedNeeds}
          />

          <Button
            onClick={() => window.open(getGoogleMapsUrl(pickup), '_blank')}
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
  );
}
