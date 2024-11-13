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

export function InfoPickerDialog({
  open, close, selectedPickup,
}) {
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNeeds, setSelectedNeeds] = React.useState([]);
  const [needs, setNeeds] = React.useState([]);

  const fetchMarker = (id) => {
    fetch(`/api/pickups/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setPickup(data);
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

  if (loading || pickup === null || pickup === undefined) {
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
        <PickupStatus pickup={pickup} PICKUP_STATUS={PICKUP_STATUS} />
        <div className="!text-[13px] font-semibold flex gap-2 items-center px-4">
          <Alert className="border-blue-200 bg-blue-100 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
              <p className="uppercase text-[11px]">Nombre:</p>
              {formatDate(pickup?.created_at)}
            </AlertTitle>
            <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-justify">
              {isEmpty(pickup?.name) ? '-' : pickup?.name}
            </AlertDescription>
          </Alert>
        </div>

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
          <p className="uppercase text-[11px]">Recogen:</p>
        </AlertTitle>
        <div
          className="flex flex-wrap w-full gap-1.5 p-4 py-1 pt-0"
        >
          {selectedNeeds.map((need) => {
            const needDb = needs?.find(((rawNeed) => rawNeed.key === need)) ?? null;
            const { label, icon, key } = needDb;

            return (
              <div
                key={label}
                className={`flex items-center mb-0 basis-[100px] gap-1.5 flex-1 ${
                  selectedNeeds.includes(key) ? 'bg-blue-400 border-blue-600 border-1' : 'bg-zinc-100'
                } rounded-xl border border-zinc-200 p-1.5`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                >
                  <Icon
                    icon={icon}
                    width="20"
                    height="20"
                    style={{ color: '#202020' }}
                  />
                </div>
                <span
                  className="font-semibold text-[13px] uppercase leading-tight"
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="p-4 pt-0 flex flex-col gap-1">
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
