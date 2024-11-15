import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { isEmpty } from 'lodash';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { getGoogleMapsUrl } from '@/lib/getAdress';
import { formatDate } from '@/lib/date';

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PICKUP_STATUS } from '@/lib/enums';
import { PickupStatus } from '../custom/pickup-status';
import NeedsSliderDialog from './pickup/NeedsSliderDialog';
import { Slider } from '../ui/slider';

export function InfoPickerDialog({
  open, close, selectedPickup,
}) {
  const [loading, setLoading] = useState(true);
  const [selectedNeeds, setSelectedNeeds] = React.useState([]);
  const [needs, setNeeds] = React.useState([]);

  const [needsSatisfied, setNeedsSatisfied] = useState(
    Array.from({ length: selectedNeeds.length }, () => 0),
  );

  const fetchMarker = (id) => {
    fetch(`/api/pickups/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setSelectedNeeds(data?.needs?.split(',') ?? []);
      })
      .catch((error) => toast.error(`Error loading marker ${error}`));
  };

  const fetchNeeds = () => {
    fetch('/api/pickups/needs')
      .then((response) => response.json())
      .then((data) => setNeeds(data))
      .catch((error) => toast.error(`Error loading markers: ${error}`));
  };

  useEffect(() => {
    setLoading(true);
    const fetch = async () => {
      fetchMarker(selectedPickup.id);
      fetchNeeds();
    };

    fetch();
  }, [selectedPickup.id, selectedPickup.latitude, selectedPickup.longitude]);

  useEffect(() => {
    if (isEmpty(selectedPickup)) return;
    setNeedsSatisfied(selectedPickup?.needsSatisfied?.split(','));
  }, [selectedPickup]);

  if (loading || selectedPickup === null || selectedPickup === undefined) {
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
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl p-0 overflow-y-auto max-h-[90%] gap-2">
        <DialogHeader className="pt-4">
          <DialogTitle className="uppercase font-bold text-[13px] flex items-center gap-1 justify-center flex-col gap-0">
            Información
          </DialogTitle>
          <DialogDescription className="text-center font-medium text-[12px] p-0 m-0 hidden">
            -
          </DialogDescription>
        </DialogHeader>
        <PickupStatus pickup={selectedPickup} PICKUP_STATUS={PICKUP_STATUS} />
        <div className="!text-[13px] font-semibold flex gap-2 items-center px-4">
          <Alert className="border-blue-200 bg-blue-100 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
              <p className="uppercase text-[11px]">Nombre:</p>
              {formatDate(selectedPickup?.created_at)}
            </AlertTitle>
            <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-justify">
              {isEmpty(selectedPickup?.name) ? '-' : selectedPickup?.name}
            </AlertDescription>
          </Alert>
        </div>

        <div className="!text-[13px] font-semibold flex gap-2 items-center px-4">
          <Alert className="border-zinc-200 bg-zinc-100 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
              <p className="uppercase text-[11px]">Ubicación:</p>
              <span className="uppercase">
                {selectedPickup?.location?.name ?? '-'}
              </span>
            </AlertTitle>
            <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto">
              {selectedPickup?.address ?? '-'}
            </AlertDescription>
          </Alert>
        </div>
        <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0 px-4">
          <p className="uppercase text-[11px]">Capacidades:</p>
        </AlertTitle>
        <div className="flex flex-col w-full gap-1.5 p-4 py-1 pt-0">
          {!isEmpty(needs)
            && selectedNeeds.map((need, index) => {
              const needDB = needs.find((n) => n.key === need);
              if (!needDB) return null;

              const { label, icon } = needDB;
              return (
                <div
                  key={label}
                  className={`flex items-center mb-0 gap-1.5 flex-1 
                      'bg-zinc-100'
                    } rounded-xl border border-zinc-200 p-2 pb-3`}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center">
                    <Icon
                      icon={icon}
                      width="20"
                      height="20"
                      style={{ color: '#202020' }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="w-full flex justify-between">
                      <span className="font-semibold text-[12px] uppercase leading-tight">
                        {label}
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        {needsSatisfied[index]}
                        %
                      </span>
                    </div>

                    <Slider
                      value={[needsSatisfied[index]]}
                      max={100}
                      step={1}
                      disabled
                    />
                  </div>

                </div>
              );
            })}
        </div>
        <div className="p-4 pt-0 flex flex-col gap-1">
          <NeedsSliderDialog
            selectedNeeds={selectedPickup?.needs?.split(',') ?? []}
            pickup={selectedPickup}
          />
          <Button
            onClick={() => window.open(getGoogleMapsUrl(selectedPickup), '_blank')}
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
