/* eslint-disable react/no-unstable-nested-components */
import { MarkerDot } from '@/components/custom/marker-badge';
import { TreeView } from '@/components/tree-view';
import { Badge } from '@/components/ui/badge';
import { useMarkers } from '@/context/MarkerContext';
import { usePickups } from '@/context/PickupContext';
import { useTowns } from '@/context/TownContext';
import { MARKER_STATUS, PICKUP_STATUS } from '@/lib/enums';
import { Icon } from '@iconify/react';
import { FlyToInterpolator } from 'deck.gl';
import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';
import React, {
  memo, useEffect, useMemo, useState,
} from 'react';

function TownLabel({ item }) {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <p className="font-semibold text-[11px] uppercase">{item.name}</p>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-1">
          <div className="flex gap-1">
            <Icon icon="ep:help" width="14" height="14" />
            {item.total_helpers_markers}
          </div>
        </Badge>
        <Badge variant="secondary" className="px-1">
          <div className="flex gap-1">
            <Icon icon="ph:package" width="14" height="14" />
            {item.total_point_markers}
          </div>
        </Badge>
      </div>
    </div>
  );
}

function MarkerLabel({ marker, onClick }) {
  return (
    <div
      className="flex items-center gap-2 w-full"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      role="button"
      aria-hidden="true"
    >
      <div className="flex items-center gap-0">
        <Badge
          style={{
            backgroundColor: marker.status !== MARKER_STATUS.COMPLETADO
              ? `rgb(${marker.type.color.join(',')})` : `rgb(${[140, 140, 140].join(',')})`,
          }}
          className="text-white uppercase p-1 text-[11px] rounded-xl"
        >
          <Icon icon={marker.type.icon} className="w-3 h-3" />
        </Badge>
      </div>
      <div className="w-full flex items-center justify-between">
        <p
          className={`max-w-[150px] text-wrap font-semibold 
        text-justify line-clamp-2 truncate text-ellipsis text-xs uppercase
        ${marker.status === MARKER_STATUS.COMPLETADO ? 'line-through' : ''}`}
        >
          SOLICITUD&nbsp;
          {marker.id}
        </p>
        <div className="flex items-center gap-2 pr-1.5">
          {DateTime.fromISO(marker.created_at) < DateTime.now().minus({ days: 2 }) && (
          <Icon icon="tabler:clock-x" className="w-3.5 h-3.5" color="red" />
          )}
          <MarkerDot marker={marker} />
        </div>
      </div>
    </div>
  );
}

function PickupLabel({ pickup, onClick }) {
  return (
    <div
      className="flex items-center gap-2 w-full justify-between"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      role="button"
      aria-hidden="true"
    >
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
      {pickup.verified && <Icon icon="material-symbols:verified-rounded" color="#2160ff" className="w-4 h-4" />}
    </div>
  );
}

function SectionLabel({ name, count }) {
  return (
    <div className="flex items-center justify-between w-full">
      <p className="font-semibold text-[11px] uppercase">{name}</p>
      <Badge variant="secondary" className="px-1">
        {count}
      </Badge>
    </div>
  );
}

function DrawerTreeComp({ setViewState }) {
  const [towns, setTowns] = useState([]);
  const [groupedMarkers, setGroupedMarkers] = useState({});
  const [groupedCompletedMarkers, setGroupedCompletedMarkers] = useState({});
  const [groupedPickups, setGroupedPickups] = useState({});

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
    if (isEmpty(markers)) return;

    const groupdData = Object.groupBy(
      markers.filter((m) => m.status !== MARKER_STATUS.COMPLETADO),
      ({ location }) => location.id,
    ) || {};

    const groupdCompletedData = Object.groupBy(
      markers.filter((m) => m.status === MARKER_STATUS.COMPLETADO),
      ({ location }) => location.id,
    ) || {};

    setGroupedMarkers(groupdData);
    setGroupedCompletedMarkers(groupdCompletedData);
  }, [markers]);

  useEffect(() => {
    const groupdData = Object.groupBy(pickups, ({ location }) => location.id) || {};
    setGroupedPickups(groupdData);
  }, [pickups]);

  const treeData = useMemo(
    () => towns.map((town) => ({
      id: town.id,
      icon: <Icon icon="duo-icons:location" className="mr-1.5 w-5 h-5" />,
      data: town,
      labelRender: () => <TownLabel item={town} />,
      children: [
        {
          id: `${town.id}_markers`,
          name: 'Solicitudes',
          icon: <Icon icon="ep:help" className="mr-1.5 w-5 h-5" />,
          labelRender: () => <SectionLabel name="Solicitudes" count={town.total_helpers_markers} />,
          children: [
            ...((groupedMarkers[town.id] || []).map((marker) => ({
              id: marker.id,
              icon: null,
              name: 'Marcador',
              data: marker,
              labelRender: () => (
                <MarkerLabel
                  marker={marker}
                  onClick={() => setViewState((prev) => ({
                    ...prev,
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                    zoom: 16,
                    transitionInterpolator: new FlyToInterpolator(),
                    transitionDuration: 1000,
                    bearing: Math.random() * 90,
                  }))}
                />
              ),
            }))),
            {
              id: `${town.id}_markers_completados`,
              name: 'COMPLETADAS',
              icon: <Icon icon="ep:success-filled" className="mr-1.5 w-5 h-5" />,
              labelRender: () => <SectionLabel name="COMPLETADAS" count={groupedCompletedMarkers[town.id]?.length ?? 0} />,
              children: (groupedCompletedMarkers[town.id] || []).map((marker) => ({
                id: marker.id,
                icon: null,
                name: 'Marcador',
                data: marker,
                labelRender: () => (
                  <MarkerLabel
                    marker={marker}
                    onClick={() => setViewState((prev) => ({
                      ...prev,
                      latitude: marker.latitude,
                      longitude: marker.longitude,
                      zoom: 16,
                      transitionInterpolator: new FlyToInterpolator(),
                      transitionDuration: 1000,
                      bearing: Math.random() * 90,
                    }))}
                  />
                ),
              })),
            },
          ],
        },
        {
          id: `${town.id}_pickups`,
          name: 'Puntos Recogida',
          icon: <Icon icon="ph:package" className="mr-1.5 w-5 h-5" />,
          labelRender: () => <SectionLabel name="Puntos Recogida" count={town.total_point_markers} />,
          children: (groupedPickups[town.id] || []).map((pickup) => ({
            id: pickup.id,
            icon: null,
            name: 'Punto de recogida',
            data: pickup,
            labelRender: () => (
              <PickupLabel
                pickup={pickup}
                onClick={() => setViewState((prev) => ({
                  ...prev,
                  latitude: pickup.latitude,
                  longitude: pickup.longitude,
                  zoom: 16,
                  transitionInterpolator: new FlyToInterpolator(),
                  transitionDuration: 1000,
                  bearing: Math.random() * 90,
                }))}
              />
            ),
          })),
        },
      ],
    })),
    [towns, groupedMarkers, groupedPickups, groupedCompletedMarkers, setViewState],
  );

  return (
    <div className="bg-white h-full rounded-md flex flex-col min-w-[250px] w-[275px]">
      <p className="font-semibold text-[12px] px-2 py-3">POBLACIONES</p>
      <div className="overflow-auto grow">
        <TreeView data={treeData} className="p-0 pr-1" />
      </div>
    </div>
  );
}

export const DrawerTree = memo(DrawerTreeComp);
