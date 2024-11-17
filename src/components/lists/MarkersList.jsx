import { useMarkers } from '@/context/MarkerContext';
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { formatDate, isOlderThanThreeDays } from '@/lib/date';
import { isEmpty } from 'lodash';
import { getGoogleMapsUrl } from '@/lib/getAdress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { MarkerBadge } from '../custom/marker-badge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

function MarkerCard({ entity }) {
  return (
    <Card className="max-w-[350px] bg-gray-50">
      <CardHeader className="px-4 py-3">
        <CardTitle className="flex items-center text-[13px] uppercase pb-0 justify-between w-full">
          <div className="flex flex-col gap-0">
            <div className="flex items-center gap-2">
              <p className="m-0 p-0 pt-0.25 ">
                Marcador
              </p>
              <code className="mt-0.5">
                {entity.id}
              </code>
            </div>
            <div className="flex gap-1 items-center font-medium text-xs">
              <Icon
                icon="fluent:hourglass-three-quarter-16-regular"
                style={{ width: 14, height: 14 }}
              />
              {entity?.created_at && formatDate(entity?.created_at)}
            </div>
          </div>
          <div className="flex gap-1 items-center flex-wrap justify-end">
            <MarkerBadge marker={entity} />
            <Badge className="text-[10px] !font-bold tracking-wide">{entity.location.name}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-4 flex flex-col gap-1">
        {isOlderThanThreeDays(entity?.created_at) && (
        <div className="!text-[13px] font-semibold gap-2 items-center basis-1/4 px-0 flex-none w-fit text-wrap">
          <Alert className="border-red-600 bg-red-400 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] items-center justify-between">
              <p className="uppercase text-[11px] leading-snug text-justify">
                <b>Atencion</b>
                , la alerta lleva un tiempo sin actualizarse.
              </p>
            </AlertTitle>
          </Alert>
        </div>
        )}
        <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
          <Alert className="border-blue-200 bg-blue-100 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] flex items-center justify-between">
              <p className="uppercase text-[11px]">Descripción:</p>
            </AlertTitle>
            <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-justify -mt-1.5">
              {isEmpty(entity?.description) ? '-' : entity?.description}
            </AlertDescription>
          </Alert>
        </div>
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

export function MarkersList() {
  const { markers } = useMarkers();
  return (
    <div className="grow-[1] basis-[200px] p-3 hidden max-h-dvh overflow-y-hidden xl:flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <code className="font-semibold uppercase">Marcadores</code>
        <Badge>{markers.length}</Badge>
      </div>
      <div className="h-full overflow-y-auto pr-2 flex flex-col gap-2">
        {markers.map((marker) => <MarkerCard entity={marker} />)}
      </div>

    </div>
  );
}
