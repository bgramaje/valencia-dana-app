import { useMarkers } from '@/context/MarkerContext';
import React, { useState } from 'react';

import { Icon } from '@iconify/react';
import { MARKER_STATUS } from '@/lib/enums';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MarkerCard } from './MarkerCard';

const statusClasses = {
  [MARKER_STATUS.COMPLETADO]: 'bg-green-500 text-green-900 hover:bg-green-500',
  [MARKER_STATUS.PENDIENTE]: 'bg-red-500 text-red-900 hover:bg-red-500',
  [MARKER_STATUS.ASIGNADO]: 'bg-orange-500 text-orange-900 hover:bg-orange-500',
};

export function MarkersList({ className }) {
  const { markers, loading } = useMarkers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Filtrar marcadores por descripción y estado
  const filteredMarkers = markers.filter((marker) => {
    const matchesSearch = marker?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus ? marker.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={cn('grow-[1] basis-[200px] p-3 flex-1 flex overflow-y-hidden flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <code className="font-semibold uppercase">Marcadores</code>
        <Badge>{filteredMarkers.length}</Badge>
      </div>

      <div className="mb-0">
        <Input
          type="text"
          placeholder="Buscar por necesidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <p className="text-[12px] font-semibold mb-0 pb-0">FILTRAR POR ESTADO:</p>

      <div className="flex gap-1 mb-0 items-center flex-wrap pr-0 xl:pr-4">
        {Object.values(MARKER_STATUS).map((status) => (
          <Badge
            key={status}
            onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
            className={`uppercase flex-1 text-center flex items-center justify-center text-[11px] cursor-pointer ${statusClasses[status]} ${
              selectedStatus === status ? 'ring-2 ring-blue-500' : ''
            }`}
            variant="outline"
          >
            {status}
          </Badge>
        ))}
      </div>

      {!loading && (
        <div className="h-full overflow-y-auto pr-2 flex flex-col gap-2">
          {filteredMarkers.length > 0 ? (
            filteredMarkers.map((marker) => <MarkerCard key={marker.id} entity={marker} />)
          ) : (
            <p className="text-gray-500 text-center">No se encontraron marcadores.</p>
          )}
        </div>
      )}

      {loading && (
        <div className="h-full overflow-y-auto pr-2 flex flex-col gap-2 flex-1">
          <Icon
            icon="line-md:loading-loop"
            width="20"
            height="20"
            style={{ color: '#202020' }}
          />
        </div>
      )}
    </div>
  );
}
