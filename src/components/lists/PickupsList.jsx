import React, { memo, useState } from 'react';

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
import { isEmpty, omit } from 'lodash';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { getGoogleMapsUrl } from '@/lib/getAdress';
import { useMapStore } from '@/app/store';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '../ui/accordion';
import { NeedSliderDisplay } from '../dialogs/InfoPickerDialog';
import { Input } from '../ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';

function PickupCardComp({ entity }) {
  const setGlobalViewState = useMapStore((state) => state.setGlobalViewState);
  const { needs: needsDB } = usePickups();
  return (
    <Card className="max-w-[350px] bg-gray-50">
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
        <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
          <Alert className="border-blue-200 bg-blue-100 px-3 py-1.5">
            <AlertTitle className="text-center text-[13px] flex items-center justify-between">
              <p className="uppercase text-[11px]">Ubicacion:</p>
            </AlertTitle>
            <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-left -mt-1.5">
              {isEmpty(entity?.address) ? '-' : entity?.address}
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
                          <NeedSliderDisplay
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

const PickupCard = memo(PickupCardComp);

export function PickupsList() {
  const { pickups, needs, loading } = usePickups(); // needs contiene todos los posibles "key"
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeed, setSelectedNeed] = useState('all'); // Usar 'all' en lugar de ''

  const filteredPickups = pickups.filter((pickup) => {
    // Filtrar por término de búsqueda
    const matchesSearch = pickup.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtrar por need seleccionado si hay alguno
    const matchesNeed = selectedNeed === 'all'
      || pickup.needs?.some((need) => need.key === selectedNeed && Number(need.value) !== 100);

    return matchesSearch && matchesNeed;
  });

  return (
    <div className="grow-[1] basis-[200px] p-3 flex-1 hidden overflow-y-hidden xl:flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <code className="font-semibold uppercase">Puntos de recogida</code>
        <Badge>{filteredPickups.length}</Badge>
      </div>

      <div className="flex gap-2 mb-0 flex-col">
        {/* Input para buscar por nombre */}
        <Input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />

        {/* Desplegable para seleccionar un need */}
        <Select onValueChange={setSelectedNeed} value={selectedNeed}>
          <SelectTrigger className="text-[12px] font-semibold flex flex-row">
            <SelectValue placeholder="Filtrar por necesidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              className="text-[12px] font-semibold flex flex-row"
              value="all"
            >
              TODOS
            </SelectItem>
            {needs.map((need) => (
              <SelectItem
                key={need.key}
                value={need.key}
                className="text-[12px] font-semibold flex flex-row"
              >
                <div className="flex gap-1 items-center">
                  <Icon icon={need.icon} style={{ color: '#202020', width: 18, height: 18 }} />
                  {need.key}
                </div>

              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!loading && (
        <div className="h-full overflow-y-auto pr-2 flex flex-col gap-2">
          {filteredPickups.length > 0 ? (
            filteredPickups.map((pickup) => <PickupCard key={pickup.id} entity={pickup} />)
          ) : (
            <p className="text-gray-500 text-center">No se encontraron puntos de recogida.</p>
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
