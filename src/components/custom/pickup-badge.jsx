import React from 'react';

import { MARKER_STATUS, PICKER_STATUS } from '@/lib/enums';
import { Badge } from '../ui/badge';

export function PickupBadge({ pickup }) {
  const statusClasses = {
    [PICKER_STATUS.ACTIVE]: 'bg-green-500 text-green-900 hover:bg-green-500',
    [PICKER_STATUS.INACTIVE]: 'bg-red-500 text-red-900 hover:bg-red-500',
    [MARKER_STATUS.ASIGNADO]: 'bg-orange-500 text-orange-900 hover:bg-orange-500',
  };

  const statusVariant = {
    [PICKER_STATUS.ACTIVE]: 'default', // Assuming "default" style for 'completado'
    [PICKER_STATUS.INACTIVE]: 'outline',
  };

  return (
    statusClasses[pickup?.status] && (
      <Badge
        variant={statusVariant[pickup?.status]}
        className={`animate-pulse ${statusClasses[pickup?.status]} hover:cursor-pointer`}
      >
        <p className="uppercase text-[11px]">
          {pickup?.status}
        </p>
      </Badge>
    )
  );
}
