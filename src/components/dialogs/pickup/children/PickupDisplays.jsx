import React from 'react';

import isEmpty from 'lodash/isEmpty';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@iconify/react';

export function PickupName({ pickup }) {
  return (

    <Alert className="border-blue-200 bg-blue-100 px-3 py-1.5">
      <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
        <p className="uppercase text-[11px]">Punto de Recogida:</p>
      </AlertTitle>
      <AlertDescription className="!text-[14px] w-full max-h-[150px] overflow-y-auto text-justify flex gap-0.5">
        {isEmpty(pickup?.name) ? '-' : pickup?.name}
        {(pickup && pickup.verified) && (
        <Icon
          icon="solar:verified-check-bold"
          style={{ width: 20, height: 20 }}
          className="text-blue-700"
        />
        )}
      </AlertDescription>
    </Alert>
  );
}

export function PickupLocation({ pickup }) {
  return (
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
  );
}

export function PickupResponsable({ pickup }) {
  return (
    <Alert className="border-green-200 bg-green-100 px-3 py-1.5">
      <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
        <p className="uppercase text-[11px]">Responsable:</p>
        <div className="flex gap-1 items-center">
          {isEmpty(pickup?.responsable_nombre) ? '-' : pickup?.responsable_nombre}
        </div>
      </AlertTitle>
    </Alert>
  );
}
