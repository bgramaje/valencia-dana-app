'use client';

import React, { memo } from 'react';
import { Icon } from '@iconify/react';

import { Dock, DockIcon } from '@/components/ui/dock';
import LayersFilter from './layers-filter';

export function DockSubactionsComp({
  setViewState,
  activeLayers,
  setActiveLayers,
}) {
  return (
    <Dock className="flex flex-col h-fit" direction="middle" iconSize={25} iconMagnification={30} iconDistance={60}>

      <DockIcon>
        <LayersFilter activeLayers={activeLayers} setActiveLayers={setActiveLayers} />
      </DockIcon>
      <DockIcon onClick={() => setViewState((prev) => ({ ...prev, zoom: prev.zoom + 0.5 }))}>
        <Icon icon="heroicons-outline:plus-sm" width={20} height={20} />
      </DockIcon>
      <DockIcon onClick={() => setViewState((prev) => ({ ...prev, zoom: prev.zoom - 0.5 }))}>
        <Icon icon="iconamoon:sign-minus" width={20} height={20} />
      </DockIcon>
    </Dock>
  );
}

export const DockSubactions = memo(DockSubactionsComp);
