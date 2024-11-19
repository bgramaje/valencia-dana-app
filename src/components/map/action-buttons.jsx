import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Legend } from './legend';

export const ActionButtons = memo(({
  isSelectingLocation,
  setIsSelectingLocation,
  getLocation,
  setIsInfoOpen,
  types,
  loading,
}) => (
  <div className="flex gap-2 flex flex-col xl:flex-row">
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        className={`min-w-[60px] h-[60px] rounded-xl ${isSelectingLocation && 'animate-pulse bg-red-400'}`}
        onClick={() => setIsSelectingLocation(true)}
      >
        <Icon
          icon="uil:map-marker-plus"
          width="40"
          height="40"
          className="text-red-300"
          style={{
            color: isSelectingLocation ? 'white' : 'black',
            width: 40,
            height: 40,
          }}
        />
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          getLocation();
        }}
        variant="outline"
        size="icon"
        className="min-w-[60px] h-[60px] rounded-xl"
      >
        <Icon
          icon="ic:twotone-gps-fixed"
          width="40"
          height="40"
          className="text-red-300"
          style={{ color: 'black', width: 40, height: 40 }}
        />
      </Button>
    </div>
    <div className="flex gap-2">
      <Button
        onClick={() => setIsInfoOpen(true)}
        variant="outline"
        size="icon"
        className="min-w-[60px] h-[60px] rounded-xl"
      >
        <Icon
          icon="ph:info-bold"
          width="40"
          height="40"
          className="text-red-300"
          style={{ color: 'black', width: 40, height: 40 }}
        />
      </Button>
      <Legend types={types} loading={loading}>
        <Button
          variant="outline"
          size="icon"
          className="min-w-[60px] h-[60px] rounded-xl"
        >
          <Icon
            icon="carbon:legend"
            width="40"
            height="40"
            className="text-red-300"
            style={{ color: 'black', width: 40, height: 40 }}
          />
        </Button>
      </Legend>

    </div>

  </div>
));
