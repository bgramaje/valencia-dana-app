'use client';

import React, { memo } from 'react';

import { Icon } from '@iconify/react';
import useMediaQuery from '@/hooks/useMediaQuery';
import { MARKER_LAYERS, PICKUP_STATUS } from '@/lib/enums';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';

import { Button } from '../ui/button';

export const Legend = memo(({ types, loading = true, children }) => {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) return null;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Leyenda</DrawerTitle>
          <DrawerDescription>
            Consulta la información de qué significa cada marcador
          </DrawerDescription>
        </DrawerHeader>
        <div className="w-full p-4 pb-2 pt-0">
          <Tabs defaultValue={MARKER_LAYERS.AFECTADO.label} className="w-full">
            <TabsList className="w-full">
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
            <TabsContent
              value={MARKER_LAYERS.AFECTADO.label}
              className="flex flex-wrap w-full gap-1.5"
            >
              {loading && (
                <div className="flex items-center justify-center w-full">
                  <Icon
                    icon="line-md:loading-loop"
                    width="20"
                    height="20"
                    style={{ color: '#202020' }}
                  />
                </div>
              )}
              {!loading && (types ?? []).map((type) => (
                <div
                  key={type.id}
                  className="flex items-center mb-0 basis-[100px] flex gap-1.5 flex-1 bg-zinc-100 rounded-xl border border-zinc-200 p-1.5"
                >
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
                  <span
                    className="font-semibold max-w-[60px] text-[13px] uppercase leading-tight"
                  >
                    {type.label}
                  </span>
                </div>
              ))}
            </TabsContent>

            <TabsContent
              value={MARKER_LAYERS.PUNTO.label}
              className="flex flex-wrap w-full gap-1.5"
            >
              {Object.keys(PICKUP_STATUS).map((key) => {
                const { label, color } = PICKUP_STATUS[key];
                return (
                  <div
                    key={label}
                    className="flex items-center mb-0 basis-[100px] flex gap-1.5 flex-1 bg-zinc-100 rounded-xl border border-zinc-200 p-1.5"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                    >
                      <Icon
                        icon="mynaui:location-home-solid"
                        width="32"
                        height="32"
                        style={{ color }}
                      />
                    </div>
                    <span
                      className="font-semibold text-[13px] uppercase leading-tight"
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cerrar </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});
