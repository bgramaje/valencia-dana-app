import React, { memo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Icon } from '@iconify/react';
import { formatDate } from '@/lib/date';
import { useMapStore } from '@/app/store';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { GoogleMapsButtton } from '@/components/custom/buttons/google-maps-button';
import { usePickups } from '@/context/PickupContext';
import { PickupLocation, PickupResponsable } from '@/components/dialogs/pickup/children/PickupDisplays';
import { isEmpty, omit } from 'lodash';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { NeedSlider } from '@/components/dialogs/pickup/children/NeedSlider';

function PickupCardComp({ entity }) {
  const setGlobalViewState = useMapStore((state) => state.setGlobalViewState);
  const { needs: needsDB } = usePickups();

  return (
    <Card className="flex-1 bg-gray-50">
      <CardHeader className="px-4 py-3">
        <CardTitle className="flex items-center text-[13px] uppercase pb-0 justify-between w-full gap-2">
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
        <div className="!text-[13px] font-semibold flex gap-2 flex-col items-center px-0">
          <PickupLocation pickup={entity} />

          {!isEmpty(entity.responsable_nombre) && (
          <PickupResponsable pickup={entity} />
          )}
        </div>
        {entity?.needs?.length > 0 && (
        <Alert className="text-xs border-zinc-200 px-3 py-1.5">
          <Accordion type="single" collapsible className="border-0">
            <AccordionItem value="item-1" className="border-0">
              <AccordionTrigger className="p-0 border-0">
                <AlertTitle className="uppercase text-[11px] m-0 p-0 font-medium">
                  CAPACIDADES DEL PUNTO :
                </AlertTitle>
              </AccordionTrigger>
              <AccordionContent className="p-0 pt-2 border-0">
                <AlertDescription className="text-xs flex flex-col items-center gap-1 font-regular w-full">
                  <div className="flex flex-col w-full gap-1.5 p-0 py-1 pt-0 max-h-[280px] overflow-y-auto">
                    {!isEmpty(needsDB) && (entity?.needs ?? []).map((need) => {
                      const needDB = needsDB.find((n) => n.key === need.key);
                      if (!needDB) return null;
                      return (
                        <NeedSlider
                          key={needDB.key}
                          {...omit(needDB, ['key'])}
                          value={need?.value ?? 0}
                        />
                      );
                    })}
                  </div>
                </AlertDescription>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Alert>
        )}

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
        <GoogleMapsButtton entity={entity} />
      </CardFooter>
    </Card>
  );
}

export const PickupCard = memo(PickupCardComp);
