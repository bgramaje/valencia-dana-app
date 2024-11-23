import React, { useState } from 'react';

import { usePickups } from '@/context/PickupContext';
import { Icon } from '@iconify/react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PickupCard } from './PickupCard';

export function PickupsList({ className }) {
  const { pickups, needs, loading } = usePickups(); // needs contiene todos los posibles "key"
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeed, setSelectedNeed] = useState('all'); // Usar 'all' en lugar de ''

  const filteredPickups = pickups.filter((pickup) => {
    // Filtrar por término de búsqueda
    const matchesSearch = pickup.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtrar por need seleccionado si hay alguno
    const matchesNeed = selectedNeed === 'all'
      || pickup.needs?.some((need) => need.key === selectedNeed && Number(need.value) !== 100);

    return matchesSearch && matchesNeed;
  });

  return (
    <div className={cn('grow-[1] basis-[200px] p-3 flex-1 flex overflow-y-hidden flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <code className="font-semibold uppercase">Puntos de recogida</code>
        <Badge>{filteredPickups.length}</Badge>
      </div>

      <div className="flex gap-2 mb-0 flex-col">
        {/* Input para buscar por nombre */}
        <Input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />

        {/* Desplegable para seleccionar un need */}
        <Select onValueChange={setSelectedNeed} value={selectedNeed}>
          <SelectTrigger className="text-[12px] font-semibold flex flex-row">
            <SelectValue placeholder="Filtrar por necesidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              className="text-[12px] font-semibold flex flex-row"
              value="all"
            >
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

      {!loading && (
        <div className="h-full overflow-y-auto pr-2 flex flex-col gap-2">
          {filteredPickups.length > 0 ? (
            filteredPickups.map((pickup) => <PickupCard key={pickup.id} entity={pickup} />)
          ) : (
            <p className="text-gray-500 text-center">No se encontraron puntos de recogida.</p>
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
