import React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';

export default function PrivacyPolicyAlert({ entity }) {
  return (
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
              {entity?.policy_accepted && (
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
  );
}

export function MarkerPrivacyPolicyAlert({ marker }) {
  return (
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
              {marker?.policy_accepted && (
              <li>
                {marker?.helper_name
                  ? 'Tanto solicitante como voluntario han aceptado las'
                  : 'El solicitante ha aceptado las'}
                {' '}
                <a href="/privacy-policy" className="text-blue-500 underline">políticas de privacidad</a>
              </li>
              )}
              {marker?.data_usage && (
              <li>
                {marker?.helper_name
                  ? 'Tanto solicitante como voluntario han aceptado'
                  : 'El solicitante ha aceptado'}
                {' '}
                hacer visible la información introducida en el formulario.
              </li>
              )}
            </AlertDescription>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Alert>
  );
}
