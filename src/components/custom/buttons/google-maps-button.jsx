import { Button } from '@/components/ui/button';
import { getGoogleMapsUrl } from '@/lib/getAdress';
import { Icon } from '@iconify/react';
import React from 'react';

export function GoogleMapsButtton({ entity }) {
  return (
    <Button
      onClick={() => window.open(getGoogleMapsUrl(entity), '_blank')}
      className="w-full mt-0.5"
    >
      <Icon
        icon="mingcute:location-fill"
        width="20"
        height="20"
      />
      Abrir en Google Maps
    </Button>
  );
}
