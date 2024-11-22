import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDate } from '@/lib/date';
import { Icon } from '@iconify/react';
import isEmpty from 'lodash/isEmpty';
import React from 'react';

export function MarkerVolunteer({ marker }) {
  return (
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
  );
}

export function MarkerDescription({ marker }) {
  return (
    <Alert className="border-blue-200 bg-blue-100 px-3 py-1.5">
      <AlertTitle className="text-center text-[13px] flex items-center justify-between">
        <p className="uppercase text-[11px]">Descripción:</p>
        {formatDate(marker?.created_at)}
      </AlertTitle>
      <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-justify">
        {isEmpty(marker?.description) ? '-' : marker?.description}
      </AlertDescription>
    </Alert>
  );
}

export function MarkerAddress({ marker, direccion }) {
  return (
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
  );
}
