'use client';

import React, { memo } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

export const LeftButtons = memo(({ setViewState }) => (
  <div
    className="transform left-0 bottom-1/2 flex flex-col gap-1"
  >
    <Button
      onClick={() => setViewState((prev) => ({ ...prev, zoom: prev.zoom + 0.5 }))}
      variant="outline"
      size="icon"
      className="relative"
    >
      <Icon icon="heroicons-outline:plus-sm" width={20} height={20} />
    </Button>
    <Button
      onClick={() => setViewState((prev) => ({ ...prev, zoom: prev.zoom - 0.5 }))}
      variant="outline"
      size="icon"
      className="relative"
    >
      <Icon icon="iconamoon:sign-minus" width={20} height={20} />
    </Button>
  </div>
));
