import React, { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePickups } from '@/context/PickupContext';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import { PickupCard } from './PickupCard';

function PickupVirtualizedList({ data, cb }) {
  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 12,
    gap: 0,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto pr-2 flex flex-col gap-2"
    >
      <div
        className="relative w-full"
        style={{ height: `${totalSize}px` }}
      >
        <div
          className="absolute top-0 left-0 w-full flex flex-col gap-2"
          style={{
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
          }}
        >
          {virtualItems.map((virtualItem) => {
            const { index, key } = virtualItem;
            const listItem = data[index];

            return (
              <div
                key={key}
                data-index={index}
                ref={virtualizer.measureElement}
              >
                <PickupCard
                  id={key}
                  cb={cb}
                  entity={listItem}
                />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export function PickupsList({ className, cb = null }) {
  const { pickups, needs, loading } = usePickups();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeed, setSelectedNeed] = useState('all');

  const filteredPickups = useMemo(() => pickups.filter((pickup) => {
    const matchesSearch = pickup.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNeed = selectedNeed === 'all'
        || pickup.needs?.some((need) => need.key === selectedNeed && Number(need.value) !== 100);

    return matchesSearch && matchesNeed;
  }), [pickups, searchTerm, selectedNeed]);

  return (
    <div className={cn('grow-[1] basis-[200px] p-3 flex-1 flex overflow-y-hidden flex-col gap-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <code className="font-semibold uppercase">Puntos de recogida</code>
        <Badge>{filteredPickups.length}</Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-0 flex-col">
        <Input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />

        <Select onValueChange={setSelectedNeed} value={selectedNeed}>
          <SelectTrigger className="text-[12px] font-semibold flex flex-row">
            <SelectValue placeholder="Filtrar por necesidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="text-[12px] font-semibold flex flex-row" value="all">
              TODOS
            </SelectItem>
            {needs.map((need) => (
              <SelectItem
                key={need.key}
                value={need.key}
                className="text-[12px] font-semibold flex flex-row"
              >
                <div className="flex gap-1 items-center">
                  <Icon icon={need.icon} style={{ color: '#202020', width: 18, height: 18 }} />
                  {need.key}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PickupVirtualizedList data={filteredPickups} cb={cb} />

      {/* Empty or Loading States */}
      {!loading && filteredPickups.length === 0 && (
        <div className="h-full flex items-center justify-center text-gray-500">
          No hay puntos de recogida que coincidan con los filtros.
        </div>
      )}
      {loading && (
        <div className="h-full flex items-center justify-center">
          <Icon icon="line-md:loading-loop" width="24" height="24" style={{ color: '#202020' }} />
        </div>
      )}
    </div>
  );
}
