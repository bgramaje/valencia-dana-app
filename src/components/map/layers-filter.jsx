/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';

import { Icon } from '@iconify/react';
import { MARKER_LAYERS, MARKER_STATUS, PICKUP_STATUS } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '../ui/label';

function LayersFilterComp({ activeLayers, setActiveLayers }) {
  const [open, setOpen] = useState(false);

  const handleLayerToggle = (layer) => {
    setActiveLayers((prevState) => ({
      ...prevState,
      [layer]: !prevState[layer],
    }));
  };

  const handleCloseDialog = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Icon icon="solar:layers-bold-duotone" width={20} height={24} />
      </DialogTrigger>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-1">
        <DialogTitle className="uppercase font-bold text-[14px] text-center">
          Seleccionar Capas
        </DialogTitle>
        <DialogDescription className="text-center font-medium text-[12px]">
          Activa los tipos de marcadores que ver.
        </DialogDescription>
        <div className="flex justify-center gap-6 mt-2">
          <Tabs defaultValue={MARKER_LAYERS.AFECTADO.label} className="w-full">
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
            <TabsContent
              value={MARKER_LAYERS.AFECTADO.label}
              className="flex flex-wrap w-full gap-1.5 flex-col"
            >
              {
                Object.keys(MARKER_STATUS).map((status) => (
                  <div className="flex items-center space-x-2 w-full justify-between">
                    <Label htmlFor={status.toLowerCase()} className="text-[12px] font-semibold">{status}</Label>
                    <Switch
                      id={status.toLowerCase()}
                      checked={activeLayers[`marker-${status.toLowerCase()}`]}
                      onClick={() => handleLayerToggle(`marker-${status.toLowerCase()}`)}
                    />
                  </div>
                ))
              }
            </TabsContent>
            <TabsContent
              value={MARKER_LAYERS.PUNTO.label}
              className="flex flex-wrap w-full gap-1.5 flex-col"
            >
              {
                Object.keys(PICKUP_STATUS).map((status) => (
                  <div className="flex items-center space-x-2 w-full justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          backgroundColor: PICKUP_STATUS[status].color,
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
                      <Label htmlFor={status} className="text-[12px] font-semibold uppercase">{PICKUP_STATUS[status].label}</Label>
                    </div>
                    <Switch
                      id={status}
                      checked={activeLayers[`pickup-${status}`]}
                      onClick={() => handleLayerToggle(`pickup-${status}`)}
                    />
                  </div>
                ))
              }
            </TabsContent>
          </Tabs>

        </div>
        <DialogFooter className="mt-2">
          <Button
            className="w-full uppercase text-[12px] font-semibold"
            onClick={handleCloseDialog} // Llamada a la función para cerrar el dialog
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const LayersFilter = React.memo(LayersFilterComp);

export default LayersFilter;
