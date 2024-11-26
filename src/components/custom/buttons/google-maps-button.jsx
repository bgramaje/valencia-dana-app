import { Button } from '@/components/ui/button';
import { getGoogleMapsUrl } from '@/lib/getAdress';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import React from 'react';

export function GoogleMapsButtton({ entity, className, text }) {
  return (
    <Button
      onClick={() => window.open(getGoogleMapsUrl(entity), '_blank')}
      className={cn('w-full mt-0.5', className)}
    >
      <Icon
        icon="mingcute:location-fill"
        width="20"
        height="20"
      />
      {text ?? 'Abrir en Google Maps'}
    </Button>
  );
}
