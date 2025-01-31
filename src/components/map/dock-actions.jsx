'use client';

import React from 'react';
import { Icon } from '@iconify/react';

import { Dock, DockIcon } from '@/components/ui/dock';

export function DockDemo({
  isSelectingLocation,
  setIsSelectingLocation,
  getLocation,
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dock direction="middle">
      <DockIcon onClick={() => setIsSelectingLocation(!isSelectingLocation)}>
        <Icon
          className={isSelectingLocation && 'animate-bounce'}
          icon={!isSelectingLocation ? 'uil:map-marker-plus' : 'ic:outline-location-off'}
          width="40"
          height="40"
        />
      </DockIcon>
      <DockIcon onClick={(e) => {
        e.preventDefault();
        getLocation();
      }}
      >
        <Icon
          icon="ic:twotone-gps-fixed"
          width="40"
          height="40"
          style={{
            width: 40,
            height: 40,
          }}
        />
      </DockIcon>
    </Dock>
  );
}
