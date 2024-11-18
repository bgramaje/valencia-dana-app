import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { isEmpty, omit } from 'lodash';

function NeedSliderDisplay(props) {
  const {
    label, icon, value, onSliderChange,
  } = props;

  return (
    <div
      key={label}
      className={`
        flex items-center mb-0 gap-1.5 flex-1 bg-zinc-50
        rounded-xl border border-zinc-200 p-2 pb-3
      `}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center">
        <Icon icon={icon} style={{ color: '#202020', width: 20, height: 20 }} />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="w-full flex justify-between">
          <span className="font-semibold text-[12px] uppercase leading-tight">{label}</span>
          <span className="text-xs font-medium text-gray-600">{`${value}%`}</span>
        </div>

        <Slider
          value={[value]}
          max={100}
          step={1}
          onValueChange={onSliderChange}
        />
      </div>
    </div>
  );
}

export function NeedsSliderDialog({
  selectedNeeds, pickup, updatePickup, needs, setPickup, setSelectedNeeds,
}) {
  const [actualNeeds, setAcutalNeeds] = useState(selectedNeeds);
  const [open, setOpen] = useState(false); // Estado para controlar si el Dialog está abierto o cerrado

  const handleConfirm = useCallback(() => {
    setOpen(false);
    updatePickup(
      pickup.id,
      { needs: actualNeeds },
      (data) => {
        setPickup(data);
        setSelectedNeeds(data.needs);
      },
    );
  }, [pickup, actualNeeds, updatePickup, setPickup, setSelectedNeeds]);

  useEffect(() => {
    if (open) return;
    setAcutalNeeds(selectedNeeds);
  }, [open, setAcutalNeeds, selectedNeeds]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-violet-400 border-violet-500 font-medium uppercase text-[12px]">
          <Icon icon="hugeicons:money-bag-01" style={{ width: 20, height: 20 }} />
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
        <div className="flex flex-col w-full gap-1.5 pt-2 max-h-[300px] overflow-y-auto pr-2">
          {!isEmpty(needs) && (actualNeeds ?? []).map((need, index) => {
            const needDB = needs.find((n) => n.key === need.key);
            if (!needDB) return null;
            return (
              <NeedSliderDisplay
                key={needDB.key}
                {...omit(needDB, ['key'])}
                value={need?.value ?? 0}
                onSliderChange={(value) => setAcutalNeeds(
                  (prev) => prev.map((item, idx) => (idx === index ? { ...item, value: value[0] } : item)),
                )}
              />
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
