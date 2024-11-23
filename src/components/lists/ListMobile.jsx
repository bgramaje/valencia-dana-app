import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { MARKER_LAYERS } from '@/lib/enums';
import { Icon } from '@iconify/react';
import { MarkersList } from './marker/MarkersList';
import { PickupsList } from './pickup/PickupsList';

export function ListMobile({ children }) {
  return (
    <Drawer>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerTitle />
      <DrawerContent className=" h-[95%] px-2 flex flex-col">
        <Tabs
          defaultValue={MARKER_LAYERS.AFECTADO.label}
          className="w-full h-full flex-1 flex flex-col"
        >
          <TabsList className="w-full px-2">
            {Object.keys(MARKER_LAYERS).map((key) => {
              const { label, icon } = MARKER_LAYERS[key];
              return (
                <TabsTrigger key={label} value={label} className="flex-1 flex gap-2 items-center">
                  <Icon icon={icon} width={20} height={20} />
                  <span className="mt-0 text-[11px] uppercase">{label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="flex flex-1 overflow-hidden">
            <TabsContent
              value={MARKER_LAYERS.AFECTADO.label}
              className="flex overflow-y-hidden"
            >
              <MarkersList className="basis-full pb-4" />
            </TabsContent>
            <TabsContent
              value={MARKER_LAYERS.PUNTO.label}
              className="flex overflow-y-hidden"
            >
              <PickupsList className="basis-full pb-4" />
            </TabsContent>
          </div>

        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
