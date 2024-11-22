import React from 'react';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

export function TelephoneButtons({ telf, entity }) {
  return (
    <div className="flex gap-1">
      <a href={`tel:${telf}`} className="flex-1">
        <Button
          className="w-full bg-blue-500 uppercase text-[12px] font-semibold"
        >
          <Icon
            icon="solar:phone-calling-bold"
            width="20"
            height="20"
          />
          Llamar
        </Button>
      </a>
      <a
        href={`
          https://wa.me/${telf.replace('+', '')}?text=${
          `📝 Punto de recogida: ${entity.name || 'No especificado'}%0A`
            + `📍 Ubicación: ${entity?.location?.name ?? '-'}%0A`
            + `🗺️ Ver en Google Maps: ${encodeURIComponent(
              `https://www.google.com/maps?q=${entity.latitude},${entity.longitude}`,
            )}`}
        `}
        target="_blank"
        className="flex-1"
        rel="noreferrer"
      >
        <Button className="w-full bg-green-700 uppercase text-[12px] font-semibold flex-1">
          <Icon icon="ic:outline-whatsapp" width="20" height="20" />
          Hablar
        </Button>
      </a>
    </div>
  );
}
