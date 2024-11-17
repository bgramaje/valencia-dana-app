import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePickups } from '@/context/PickupContext';
import { Icon } from '@iconify/react';
import { formatDate } from '@/lib/date';
import { isEmpty } from 'lodash';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { getGoogleMapsUrl } from '@/lib/getAdress';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';

function PickupCard({ entity }) {
  return (
    <Card className="max-w-[350px] bg-gray-50">
      <CardHeader className="px-4 py-3">
        <CardTitle className="flex items-center text-[13px] uppercase pb-0 justify-between w-full">
          <div className="flex items-center gap-1">
            <p className="m-0 p-0 pt-0.25 leading-tight">
              {entity.name}
            </p>
            {(entity && entity.verified) && (
              <Icon
                icon="solar:verified-check-bold"
                style={{ width: 20, height: 20 }}
                className="text-blue-700"
              />
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Badge className="text-[10px] !font-bold tracking-wide">{entity.location.name}</Badge>
          </div>
        </CardTitle>
        <CardDescription className="pb-0">
          <div className="flex gap-1 items-center font-medium text-xs -mt-1">
            <Icon
              icon="fluent:hourglass-three-quarter-16-regular"
              style={{ width: 14, height: 14 }}
            />
            {entity?.created_at && formatDate(entity?.created_at)}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 px-4 flex flex-col gap-1">
        <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
          <Alert className="border-blue-200 bg-blue-100 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] flex items-center justify-between">
              <p className="uppercase text-[11px]">Punto:</p>
            </AlertTitle>
            <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-justify -mt-1.5">
              {isEmpty(entity?.name) ? '-' : entity?.name}
            </AlertDescription>
          </Alert>
        </div>
        {!isEmpty(entity.responsable_nombre) && (
          <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
            <Alert className="border-green-200 bg-green-100 px-3 py-1.5">
              <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
                <p className="uppercase text-[11px]">Responsable:</p>
                <div className="flex gap-1 items-center">
                  {isEmpty(entity?.responsable_nombre) ? '-' : entity?.responsable_nombre}
                </div>
              </AlertTitle>
            </Alert>
          </div>
        )}
      </CardContent>
      <div className="px-4 py-2">
        <Separator />
      </div>
      <CardFooter className="px-4 -my-0.5 pb-2 flex flex-col gap-0.5">
        <Button
          onClick={() => window.open(getGoogleMapsUrl(entity), '_blank')}
          className="w-full mt-0.5 rounded-xl bg-blue-400 border-1 border-blue-900 hover:bg-blue-500"
        >
          <Icon
            icon="ic:twotone-gps-fixed"
            width="20"
            height="20"
          />
          Localizar en el mapa
        </Button>
        <Button
          onClick={() => window.open(getGoogleMapsUrl(entity), '_blank')}
          className="w-full mt-0.5 rounded-xl"
        >
          <Icon
            icon="mingcute:location-fill"
            width="20"
            height="20"
          />
          Abrir en Google Maps
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PickupsList() {
  const { pickups } = usePickups();
  return (
    <div className="grow-[1] basis-[200px] p-3 hidden max-h-dvh overflow-y-hidden xl:flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <code className="font-semibold uppercase">Puntos de recogida</code>
        <Badge>{pickups.length}</Badge>
      </div>
      <div className="h-full overflow-y-auto pr-2 flex flex-col gap-2">
        {pickups.map((marker) => <PickupCard entity={marker} />)}
      </div>
    </div>
  );
}
