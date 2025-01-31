import React from 'react';

import { MARKER_STATUS } from '@/lib/enums';
import { Badge } from '../ui/badge';

export function MarkerBadge({ marker }) {
  const statusClasses = {
    [MARKER_STATUS.COMPLETADO]: 'bg-green-500 text-green-900 hover:bg-green-500',
    [MARKER_STATUS.PENDIENTE]: 'bg-red-500 text-red-900 hover:bg-red-500',
    [MARKER_STATUS.ASIGNADO]: 'bg-orange-500 text-orange-900 hover:bg-orange-500',
  };

  const statusVariant = {
    completado: 'default', // Assuming "default" style for 'completado'
    pendiente: 'outline',
    asignado: 'outline',
  };

  return (
    statusClasses[marker?.status] && (
      <Badge
        variant={statusVariant[marker?.status]}
        className={`animate-pulse ${statusClasses[marker?.status]} hover:cursor-pointer`}
      >
        <p className="uppercase text-[11px]">
          {marker?.status}
        </p>
      </Badge>
    )
  );
}

export function MarkerDot({ marker }) {
  const statusClasses = {
    [MARKER_STATUS.COMPLETADO]: 'bg-green-500 text-green-900 hover:bg-green-500',
    [MARKER_STATUS.PENDIENTE]: 'bg-red-500 text-red-900 hover:bg-red-500',
    [MARKER_STATUS.ASIGNADO]: 'bg-orange-500 text-orange-900 hover:bg-orange-500',
  };

  return (
    statusClasses[marker?.status] && (
      <Badge
        className={`w-2 h-2 rounded-full p-0 ${statusClasses[marker?.status]} hover:cursor-pointer`}
      />
    )
  );
}
