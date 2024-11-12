import React from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '../ui/badge';

export function PickupStatus({ pickup, PICKUP_STATUS }) {
  const getStatusComponent = (status, borderColor, bgColor) => (
    <div className="!text-[13px] font-semibold flex gap-2 items-center px-4">
      <Alert className={`border-${borderColor} bg-${bgColor} px-3 py-1.5`}>
        <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
          <p className="uppercase text-[11px]">{PICKUP_STATUS[status]?.label}</p>
          <Badge
            className={`${
              pickup.verified ? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'
            } text-white px-2 py-0.5 text-[11px] py-0 my-0`}
          >
            {pickup.verified ? 'VERIFICADO' : 'NO VERIFICADO'}
          </Badge>
        </AlertTitle>
      </Alert>
    </div>
  );

  switch (pickup.status) {
    case 'ABIERTO':
      return getStatusComponent('ABIERTO', 'green-400', 'green-300');
    case 'CERRADO':
      return getStatusComponent('CERRADO', 'red-600', 'red-500');
    case 'PARCIALMENTE':
      return getStatusComponent('PARCIALMENTE', 'yellow-600', 'yellow-300');
    case 'DESCONOCIDO':
      return getStatusComponent('DESCONOCIDO', 'zinc-600', 'zinc-300');
    default:
      return null;
  }
}
