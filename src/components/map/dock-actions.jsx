'use client';

import React from 'react';
import { Icon } from '@iconify/react';

import { Dock, DockIcon } from '@/components/ui/dock';
import { Button } from '../ui/button';
import { DrawerMarkers } from './drawers/drawer-markers';

export function DockDemo({
  isSelectingLocation,
  setIsSelectingLocation,
  getLocation,
  types,
  loading,
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
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
        <DockIcon onClick={() => setIsOpen(!isOpen)}>
          <Icon
            icon="ep:help"
            width="40"
            height="40"
            style={{
              width: 40,
              height: 40,
            }}
          />
        </DockIcon>
        <DockIcon>
          <Icon
            icon="ph:package"
            width="40"
            height="40"
            style={{
              width: 40,
              height: 40,
            }}
          />
        </DockIcon>
      </Dock>
      <DrawerMarkers open={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}
