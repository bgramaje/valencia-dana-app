/* eslint-disable react/no-unstable-nested-components */
import { TreeView } from '@/components/tree-view';
import { Badge } from '@/components/ui/badge';
import { useMarkers } from '@/context/MarkerContext';
import { usePickups } from '@/context/PickupContext';

import { useTowns } from '@/context/TownContext';
import { PICKUP_STATUS } from '@/lib/enums';
import { Icon } from '@iconify/react';

import React, { useEffect, useMemo, useState } from 'react';

export function DrawerTree() {
  const [towns, setTowns] = useState([]);
  const [groupedMarkers, setGroupedMarkers] = useState([]);
  const [groupedPickups, setGroupedPickups] = useState([]);

  const { pickups } = usePickups();
  const { fetchTowns } = useTowns();
  const { markers } = useMarkers();

  useEffect(() => {
    (async () => {
      const townsDb = await fetchTowns();
      setTowns(townsDb);
    })();
  }, [fetchTowns]);

  useEffect(() => {
    const groupdData = Object.groupBy(markers, ({ location }) => location.id);
    setGroupedMarkers(groupdData);
  }, [markers]);

  useEffect(() => {
    const groupdData = Object.groupBy(pickups, ({ location }) => location.id);
    setGroupedPickups(groupdData);
  }, [pickups]);

  const treeData = useMemo(
    () => towns.map((town) => ({
      id: town.id,
      icon: <Icon icon="duo-icons:location" className="mr-1" />,
      data: town,
      children: [
        {
          id: `${town.id}_markers`,
          name: 'Marcadores',
          icon: <Icon icon="ep:help" className="mr-1" />,
          labelRender: ({ name }) => (
            <div className="flex items-center justify-between w-full">
              <p className="font-semibold text-[11px] uppercase">{name}</p>
              <Badge variant="secondary" className="px-1">
                {town.total_helpers_markers}
              </Badge>
            </div>
          ),
          children: (groupedMarkers[town.id] ?? []).map((marker) => ({
            id: marker.id,
            icon: null,
            name: 'Marcador',
            data: marker,
            labelRender: ({ data: _marker }) => (
              <div className="flex items-center gap-2 w-full">
                <Badge
                  style={{
                    backgroundColor: `rgb(${_marker.type.color.join(',')}`,
                  }}
                  className="text-white uppercase p-1 text-[11px] rounded-xl"
                >
                  <Icon icon={_marker.type.icon} className="w-3 h-3" />
                </Badge>
                <p
                  className="max-w-[150px] text-wrap font-semibold text-justify line-clamp-2 truncate text-ellipsis text-xs uppercase"
                >
                  Marcador&nbsp;
                  {marker.id}
                </p>
              </div>
            ),
          })),
        },
        {
          id: `${town.id}_pickups`,
          name: 'Puntos Recogida',
          icon: <Icon icon="ph:package" className="mr-1" />,
          labelRender: ({ name }) => (
            <div className="flex items-center justify-between w-full">
              <p className="font-semibold text-[11px] uppercase">{name}</p>
              <Badge variant="secondary" className="px-1">
                {town.total_point_markers}
              </Badge>
            </div>
          ),
          children: (groupedPickups[town.id] ?? []).map((marker) => ({
            id: marker.id,
            icon: null,
            name: 'Marcador',
            data: marker,
            labelRender: ({ data: pickup }) => (
              <div className="flex items-center gap-2 w-full justify-between">
                <div className="flex items-center gap-2 w-full">
                  <Badge
                    style={{
                      backgroundColor: `rgb(${PICKUP_STATUS[pickup.status].rgbColor.join(',')}`,
                    }}
                    className="text-white uppercase p-1 text-[11px] rounded-xl"
                  >
                    <Icon
                      icon="ph:package"
                      className="w-3.5 h-3.5"
                      color={pickup.status === 'DESCONOCIDO' ? 'white' : '#202020'}
                    />
                  </Badge>
                  <p
                    className="max-w-[120px] text-wrap font-semibold text-left line-clamp-2 truncate text-ellipsis text-xs uppercase"
                  >
                    {pickup.name}
                  </p>
                </div>

                {pickup.verified && (
                  <Icon
                    icon="material-symbols:verified-rounded"
                    color="#2160ff"
                    className="w-4 h-4"
                  />
                )}
              </div>
            ),
          })),
        },
      ],
      labelRender: ({ data: item }) => (
        <div className="flex items-center justify-between gap-2 w-full">
          <p className="font-semibold text-[11px] uppercase">{item.name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-1">
              <div className="flex gap-1">
                <Icon
                  icon="ep:help"
                  width="14"
                  height="14"
                />
                {item.total_helpers_markers}
              </div>
            </Badge>

            <Badge variant="secondary" className="px-1">
              <div className="flex gap-1">
                <Icon
                  icon="ph:package"
                  width="14"
                  height="14"
                />
                {item.total_point_markers}
              </div>
            </Badge>
          </div>
        </div>
      ),

    })),
    [towns, groupedMarkers],
  );

  return (
    <div className="bg-white h-full rounded-md flex flex-col min-w-[250px] w-[250px]">
      <p className="font-semibold text-[12px] px-4 pt-4 pb-4">POBLACIONES</p>
      <div className="overflow-auto grow -mt-4">
        <TreeView data={treeData} />
      </div>
    </div>

  );
}
