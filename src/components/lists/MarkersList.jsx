import { useMarkers } from '@/context/MarkerContext';
import React, { memo, useState } from 'react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Icon } from '@iconify/react';
import { formatDate, isOlderThanThreeDays } from '@/lib/date';
import { isEmpty } from 'lodash';
import { getGoogleMapsUrl } from '@/lib/getAdress';
import { useMapStore } from '@/app/store';
import { MARKER_STATUS } from '@/lib/enums';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { MarkerBadge } from '../custom/marker-badge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';

const statusClasses = {
  [MARKER_STATUS.COMPLETADO]: 'bg-green-500 text-green-900 hover:bg-green-500',
  [MARKER_STATUS.PENDIENTE]: 'bg-red-500 text-red-900 hover:bg-red-500',
  [MARKER_STATUS.ASIGNADO]: 'bg-orange-500 text-orange-900 hover:bg-orange-500',
};

function MarkerCardComp({ entity }) {
  const setGlobalViewState = useMapStore((state) => state.setGlobalViewState);

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
          onClick={() => setGlobalViewState({ latitude: entity?.latitude, longitude: entity?.longitude, zoom: 16 })}
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

const MarkerCard = memo(MarkerCardComp);

export function MarkersList() {
  const { markers, loading } = useMarkers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Filtrar marcadores por descripción y estado
  const filteredMarkers = markers.filter((marker) => {
    const matchesSearch = marker.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus ? marker.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="grow-[1] basis-[200px] p-3 flex-1 hidden overflow-y-hidden xl:flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <code className="font-semibold uppercase">Marcadores</code>
        <Badge>{filteredMarkers.length}</Badge>
      </div>

      <div className="mb-0">
        <Input
          type="text"
          placeholder="Buscar por necesidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <p className="text-[12px] font-semibold mb-0 pb-0">FILTRAR POR ESTADO:</p>

      <div className="flex gap-1 mb-0 items-center flex-wrap pr-0 xl:pr-4">
        {Object.values(MARKER_STATUS).map((status) => (
          <Badge
            key={status}
            onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
            className={`uppercase flex-1 text-center flex items-center justify-center text-[11px] cursor-pointer ${statusClasses[status]} ${
              selectedStatus === status ? 'ring-2 ring-blue-500' : ''
            }`}
            variant="outline"
          >
            {status}
          </Badge>
        ))}
      </div>

      {!loading && (
        <div className="h-full overflow-y-auto pr-2 flex flex-col gap-2">
          {filteredMarkers.length > 0 ? (
            filteredMarkers.map((marker) => <MarkerCard key={marker.id} entity={marker} />)
          ) : (
            <p className="text-gray-500 text-center">No se encontraron marcadores.</p>
          )}
        </div>
      )}

      {loading && (
        <div className="h-full overflow-y-auto pr-2 flex flex-col gap-2 flex-1">
          <Icon
            icon="line-md:loading-loop"
            width="20"
            height="20"
            style={{ color: '#202020' }}
          />
        </div>
      )}
    </div>
  );
}
