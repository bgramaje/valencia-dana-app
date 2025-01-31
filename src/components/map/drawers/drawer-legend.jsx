import React from 'react';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { MARKER_LAYERS, PICKUP_STATUS } from '@/lib/enums';
import { Icon } from '@iconify/react';

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full">
      <Icon
        icon="line-md:loading-loop"
        width="20"
        height="20"
        style={{ color: '#202020' }}
      />
    </div>
  );
}

// Type Item Component
function TypeItem({ type }) {
  return (
    <div className="flex items-center mb-0 basis-[100px] gap-1.5 flex-1 bg-zinc-100 rounded-xl border border-zinc-200 p-1.5">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `rgb(${type.color.join(',')})` }}
      >
        <Icon
          icon={type.icon}
          width="16"
          height="16"
          style={{ color: '#202020' }}
        />
      </div>
      <span className="font-semibold max-w-[60px] text-[13px] uppercase leading-tight">
        {type.label}
      </span>
    </div>
  );
}

// Pickup Status Item Component
function PickupStatusItem({ status }) {
  const { label, color } = PICKUP_STATUS[status];
  return (
    <div className="items-center mb-0 basis-[100px] flex gap-1.5 flex-1 bg-zinc-100 rounded-xl border border-zinc-200 p-1.5">
      <div
        style={{
          backgroundColor: color,
        }}
        className="w-7 h-7 rounded-full flex items-center justify-center"
      >
        <Icon
          icon="ph:package"
          width="20"
          height="20"
          style={{ color: 'white' }}
        />
      </div>
      <span className="font-semibold text-[13px] uppercase leading-tight">
        {label}
      </span>
    </div>
  );
}

// Tabs List Component
function LegendTabsList() {
  return (
    <TabsList className="w-full">
      {Object.keys(MARKER_LAYERS).map((key) => {
        const { label, icon } = MARKER_LAYERS[key];
        return (
          <TabsTrigger key={label} value={label} className="flex-1 flex gap-2 items-center px-2">
            <Icon icon={icon} width={20} height={20} />
            <span className="mt-0 text-[11px] uppercase">{label}</span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}

// Tabs Content for Marker Types
function MarkerTypesContent({ types, loading }) {
  return (
    <TabsContent
      value={MARKER_LAYERS.AFECTADO.label}
      className="flex flex-wrap w-full gap-1.5"
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        (types ?? []).map((type) => (
          <TypeItem key={type.id} type={type} />
        ))
      )}
    </TabsContent>
  );
}

// Tabs Content for Pickup Statuses
function PickupStatusContent() {
  return (
    <TabsContent
      value={MARKER_LAYERS.PUNTO.label}
      className="flex flex-wrap w-full gap-1.5"
    >
      {Object.keys(PICKUP_STATUS).map((key) => (
        <PickupStatusItem key={key} status={key} />
      ))}
    </TabsContent>
  );
}

// Main Component
export function DrawerLegendComp({ types, loading = true }) {
  return (
    <div className="bg-white h-full rounded-xl flex flex-col items-center justify-center w-[275px] p-2">
      <div className="w-full p-0">
        <Tabs defaultValue={MARKER_LAYERS.AFECTADO.label} className="w-full">
          <LegendTabsList />
          <MarkerTypesContent types={types} loading={loading} />
          <PickupStatusContent />
        </Tabs>
      </div>
    </div>
  );
}

export const DrawerLegend = React.memo(DrawerLegendComp);
