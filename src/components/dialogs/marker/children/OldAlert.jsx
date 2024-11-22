import { Alert, AlertTitle } from '@/components/ui/alert';
import { formatDate } from '@/lib/date';
import React from 'react';

export function OldAlert({ marker }) {
  return (
    <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
      <Alert className="border-red-600 bg-red-400 px-3 py-1.5">
        <AlertTitle className="text-center text-[13px] flex items-center justify-between">
          <p className="uppercase text-[11px] leading-snug text-left">
            Atencion, la alerta se creó el &nbsp;
            {formatDate(marker?.created_at)}
            &nbsp;, porfavor antes de realizar la petición consulta con el afectado
          </p>
        </AlertTitle>
      </Alert>
    </div>
  );
}
