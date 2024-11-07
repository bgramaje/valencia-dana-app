/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';

import { Icon } from '@iconify/react';
import { MARKER_LAYERS } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

function LayersFilter({ activeLayers, setActiveLayers }) {
  const [open, setOpen] = useState(false); // Estado para controlar si el Dialog está abierto o cerrado

  const handleLayerToggle = (layer) => {
    setActiveLayers((prevState) => ({
      ...prevState,
      [layer]: !prevState[layer],
    }));
    // Aquí puedes agregar la lógica para activar/desactivar las capas en DeckGL
  };

  const handleCloseDialog = () => {
    setOpen(false); // Cerrar el diálogo
  };

  const activeLayerCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Icon icon="solar:layers-bold-duotone" width={20} height={20} />
          {/* Badge con el número de capas activas */}
          {activeLayerCount > 0 && (
          <span
            className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] rounded-full w-5 h-5 flex items-center justify-center"
          >
            {activeLayerCount}
          </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-1">
        <DialogTitle className="uppercase font-bold text-[14px] text-center">
          Seleccionar Capas
        </DialogTitle>
        <DialogDescription className="text-center font-medium text-[12px]">
          Marca lo que quieres ver en el mapa
        </DialogDescription>
        <div className="flex space-x-2 mt-2">
          {Object.keys(MARKER_LAYERS).map((key) => {
            const { label, icon } = MARKER_LAYERS[key];
            return (
              <div
                key={key}
                onClick={() => handleLayerToggle(key)}
                className={`flex flex-col items-center justify-center cursor-pointer p-4 w-24 h-24 rounded-2xl 
                    uppercase font-semibold ${activeLayers[key] ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-200'}
                `}
              >
                <Icon icon={icon} width={30} height={30} />
                <span className="mt-2 text-[11px]">{label}</span>
              </div>
            );
          })}
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

export default LayersFilter;
