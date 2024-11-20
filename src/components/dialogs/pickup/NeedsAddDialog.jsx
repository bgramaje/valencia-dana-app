/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { omit } from 'lodash';

const isNeedSelected = (array, need) => {
  const index = (array ?? []).findIndex((item) => item.key === need);
  return index !== -1;
};

function NeedsButtonDisplay(props) {
  const {
    needKey, label, icon, onClick, selectedNeeds,
  } = props;

  return (
    <div
      onClick={() => (onClick(needKey))}
      key={label}
      className={`flex items-center mb-0 basis-[100px] gap-1.5 flex-1 
        ${isNeedSelected(selectedNeeds, needKey) ? 'bg-blue-500 border-blue-800 border-1' : 'bg-zinc-100'
      } rounded-xl border border-zinc-200 p-1.5`}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center"
      >
        <Icon
          icon={icon}
          width="20"
          height="20"
          style={{ color: '#202020' }}
        />
      </div>
      <span
        className="font-semibold text-[13px] uppercase leading-tight"
      >
        {label}
      </span>
    </div>
  );
}

export function NeedsAddDialog({
  pickup, selectedNeeds, updatePickup, needs, setPickup, setSelectedNeeds,
}) {
  const [open, setOpen] = useState(false); // Estado para controlar si el Dialog está abierto o cerrado
  const [actualNeeds, setAcutalNeeds] = useState(selectedNeeds);

  const handleConfirm = () => {
    let statusDB;

    if (actualNeeds.length === needs.length) statusDB = 'ABIERTO';
    else if (actualNeeds.length === 0) statusDB = 'CERRADO';
    else if (actualNeeds.length !== needs.length) statusDB = 'PARCIALMENTE';
    else statusDB = 'DESCONOCIDO';

    updatePickup(
      pickup.id,
      { needs: actualNeeds, status: statusDB },
      (data) => {
        setPickup(data);
        setSelectedNeeds(data.needs);
        setOpen(false); // Close the modal
      },
    );
  };

  const toggleItem = (key) => {
    setAcutalNeeds((prev) => {
      const index = prev.findIndex((item) => item.key === key);
      if (index !== -1) {
        // Key exists, remove it
        return prev.filter((_, idx) => idx !== index);
      }
      // Key does not exist, add new item
      return [...prev, { key, value: '0' }];
    });
  };

  useEffect(() => {
    if (open) return;
    setAcutalNeeds(selectedNeeds);
  }, [open, setAcutalNeeds, selectedNeeds]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-orange-400 border-orange-500 font-medium uppercase text-[12px] font-semibold">
          <Icon icon="ep:help" style={{ width: 20, height: 20 }} />
          Añadir Necesidades
        </Button>
      </DialogTrigger>
      <DialogContent
        inert={!open}
        className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-1"
      >
        <DialogTitle className="uppercase font-bold text-[14px] text-center">
          Añadir Necesidades
        </DialogTitle>
        <DialogDescription className="text-center font-medium text-[12px]">
          Añade nuevas necesidades que se recolecten en el punto de recogida
        </DialogDescription>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pt-2">
          <div
            className="flex flex-wrap w-full gap-1.5 hover:cursor-pointer"
          >
            {needs.map((need) => (
              <NeedsButtonDisplay
                key={need.key}
                {...omit(need, ['key'])}
                needKey={need.key}
                selectedNeeds={actualNeeds}
                onClick={(key) => toggleItem(key)}
              />
            ))}
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button
            className="w-full uppercase text-[12px] font-semibold"
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
