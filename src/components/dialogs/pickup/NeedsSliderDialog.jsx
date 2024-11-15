/* eslint-disable prefer-destructuring */
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { isEmpty } from 'lodash';
import { usePickups } from '@/context/PickupContext';

function NeedsSliderDialog({ selectedNeeds, pickup }) {
  const { updatePickup, fetchPickup } = usePickups();
  const [open, setOpen] = useState(false); // Estado para controlar si el Dialog está abierto o cerrado
  const [needs, setNeeds] = React.useState([]);

  const [needsSatisfied, setNeedsSatisfied] = useState(
    Array.from({ length: selectedNeeds.length }, () => 0),
  );

  const fetchNeeds = () => {
    fetch('/api/pickups/needs')
      .then((response) => response.json())
      .then((data) => setNeeds(data))
      .catch((error) => toast.error(`Error loading markers: ${error}`));
  };

  const handleSliderChange = (index, value) => {
    setNeedsSatisfied((prev) => {
      const updated = [...prev];
      updated[index] = value[0]; // Assume slider returns an array [value]
      return updated;
    });
  };

  const handleConfirm = () => {
    setOpen(false); // Close the modal
    updatePickup({ needsSatisfied: needsSatisfied.join(',') }, () => fetchPickup());
  };

  useEffect(() => {
    if (isEmpty(pickup)) return;
    setNeedsSatisfied(pickup?.needsSatisfied?.split(','));
  }, [pickup]);

  useEffect(() => {
    fetchNeeds();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-violet-400 border-violet-500 font-medium">
          <Icon icon="tabler:square-rounded-percentage" style={{ width: 20, height: 20 }} />
          Actualizar Capacidad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-1">
        <DialogTitle className="uppercase font-bold text-[14px] text-center">
          Actualizar Capacidad
        </DialogTitle>
        <DialogDescription className="text-center font-medium text-[12px]">
          Actualiza las capacidades de cada uno de los tipos de productos que se recogen
        </DialogDescription>
        <div className="flex flex-col w-full gap-1.5 pt-2">
          {!isEmpty(needs)
            && selectedNeeds.map((need, index) => {
              const needDB = needs.find((n) => n.key === need);
              if (!needDB) return null;

              const { label, icon } = needDB;
              return (
                <div
                  key={label}
                  className={`flex items-center mb-0 gap-1.5 flex-1 
                      'bg-zinc-100'
                    } rounded-xl border border-zinc-200 p-2 pb-3`}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center">
                    <Icon
                      icon={icon}
                      width="20"
                      height="20"
                      style={{ color: '#202020' }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="w-full flex justify-between">
                      <span className="font-semibold text-[12px] uppercase leading-tight">
                        {label}
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        {needsSatisfied[index]}
                        %
                      </span>
                    </div>

                    <Slider
                      defaultValue={[needsSatisfied[index]]}
                      max={100}
                      step={1}
                      onValueChange={(value) => handleSliderChange(index, value)}
                    />
                  </div>

                </div>
              );
            })}
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

export default NeedsSliderDialog;
