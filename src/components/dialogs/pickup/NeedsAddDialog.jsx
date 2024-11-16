import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import { usePickups } from '@/context/PickupContext';

export function NeedsAddDialog({ pickup, rawNeeds }) {
  const { updatePickup, fetchPickup } = usePickups();
  const [open, setOpen] = useState(false); // Estado para controlar si el Dialog está abierto o cerrado
  const [needs, setNeeds] = useState([]);
  const [selectedNeeds, setSelectedNeeds] = useState(rawNeeds ?? []);
  const [needsSatisfied, setNeedsSatisfied] = useState([]);

  const fetchNeeds = () => {
    fetch('/api/pickups/needs')
      .then((response) => response.json())
      .then((data) => setNeeds(data))
      .catch((error) => toast.error(`Error loading markers: ${error}`));
  };

  const handleConfirm = () => {
    setOpen(false); // Close the modal
    updatePickup({ needsSatisfied: needsSatisfied.join(',') }, () => fetchPickup());
  };

  const selectNeed = (need) => {
    setSelectedNeeds((prev) => {
      if (prev.includes(need)) {
        return prev.filter((item) => item !== need); // Remove if it exists
      }
      return [...prev, need]; // Add if it doesn't exist
    });
  };

  useEffect(() => {
    fetchNeeds();
  }, []);

  useEffect(() => {
    if (isEmpty(pickup)) return;
    setNeedsSatisfied(pickup?.needsSatisfied?.split(',') ?? []);
  }, [pickup]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-orange-400 border-orange-500 font-medium uppercase text-[12px] font-semibold">
          <Icon icon="ep:help" style={{ width: 20, height: 20 }} />
          Añadir Necesidades
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-1">
        <DialogTitle className="uppercase font-bold text-[14px] text-center">
          Añadir Necesidades
        </DialogTitle>
        <DialogDescription className="text-center font-medium text-[12px]">
          Añade nuevas necesidades que se recolecten en el punto de recogida
        </DialogDescription>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pt-2">
          <div
            className="flex flex-wrap w-full gap-1.5"
          >
            {needs.map((need) => {
              const { label, icon, key } = need;
              return (
                <div
                  onClick={() => (selectNeed(key))}
                  key={label}
                  className={`flex items-center mb-0 basis-[100px] gap-1.5 flex-1 
                      ${selectedNeeds.includes(key) ? 'bg-blue-500 border-blue-800 border-1' : 'bg-zinc-100'
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
            })}
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
