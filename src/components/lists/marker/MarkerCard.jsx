import React, { memo } from 'react';

import { Icon } from '@iconify/react';
import { useMapStore } from '@/app/store';
import useIsAdmin from '@/hooks/useIsAdmin';
import { MARKER_STATUS } from '@/lib/enums';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMarkers } from '@/context/MarkerContext';
import { Separator } from '@/components/ui/separator';
import { formatDate, isOlderThanThreeDays } from '@/lib/date';
import { MarkerBadge } from '@/components/custom/marker-badge';
import { OldAlert } from '@/components/dialogs/marker/children/OldAlert';
import { GoogleMapsButtton } from '@/components/custom/buttons/google-maps-button';
import { MarkerDescription } from '@/components/dialogs/marker/children/MarkerDisplays';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { CompleteButton, DeleteButton } from '@/components/dialogs/marker/children/MarkerButtons';

function MarkerCardComp({ entity }) {
  const setGlobalViewState = useMapStore((state) => state.setGlobalViewState);
  const { completeMarker, deleteMarker } = useMarkers();

  const isAdmin = useIsAdmin();

  const handleComplete = () => {
    completeMarker(entity?.id, process.env.NEXT_PUBLIC_MASTER_KEY_PICKUPS);
  };

  const handleDelete = () => {
    deleteMarker(entity?.id, process.env.NEXT_PUBLIC_MASTER_KEY_PICKUPS);
  };

  return (
    <Card className="flex-1 bg-gray-50">
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
        <div className="!text-[13px] font-semibold gap-2 items-center basis-1/4 px-0 flex flex-col w-full text-wrap">
          {isOlderThanThreeDays(entity?.created_at) && (<OldAlert marker={entity} />)}
          <MarkerDescription marker={entity} />
          <Separator />
        </div>
      </CardContent>
      <CardFooter className="px-4 -my-0.5 py-2 flex flex-col gap-0.5">
        {isAdmin && (
        <div className="flex gap-1 items-center w-full">
          {(entity.status !== MARKER_STATUS.COMPLETADO) && (
            <CompleteButton
              onClick={handleComplete}
              className="flex-1 rounded-xl"
            />
          )}
          <DeleteButton
            onClick={handleDelete}
            className="flex-1 rounded-xl"
          />
        </div>
        )}
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
        <GoogleMapsButtton
          entity={entity}
          className="rounded-xl"
        />
      </CardFooter>
    </Card>
  );
}

export const MarkerCard = memo(MarkerCardComp);
