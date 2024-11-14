import React from 'react';
import { Icon } from '@iconify/react';

import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { MARKER_LAYERS } from '@/lib/enums';

function ChooseCreateDialog({ open, setOpen, cb }) {
  const handleClick = (type) => {
    setOpen(false); // Cerrar el diálogo
    cb(type);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-1">
        <DialogTitle className="uppercase font-bold text-[14px] text-center">
          Selecciona Tipo
        </DialogTitle>
        <DialogDescription className="text-center font-medium text-[12px]">
          Selecciona el tipo de marcador que quieres añadir
        </DialogDescription>
        <div className="flex justify-center gap-6 px-3 pt-4">
          {Object.keys(MARKER_LAYERS).map((key) => {
            const { label, icon } = MARKER_LAYERS[key];
            return (
              <Button
                onClick={() => handleClick(key)}
                className="flex flex-col flex-1 gap-2 h-[130px] rounded-xl"
                key={key}
              >
                <Icon icon={icon} style={{ width: '40px', height: 'auto' }} />
                <span className="mt-1 text-[12px] text-wrap uppercase font-semibold">{label}</span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ChooseCreateDialog;
